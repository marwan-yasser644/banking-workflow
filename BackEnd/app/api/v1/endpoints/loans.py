import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user, require_roles
from app.models.models import UserRole, WorkflowState, RiskLevel
from app.schemas.schemas import (
    LoanRequestCreate, LoanRequestUpdate, LoanRequestOut,
    ApprovalAction, PaginatedResponse, WorkflowLogOut
)
from app.services.loan_service import (
    create_loan_request, get_loan_request_by_id, get_all_loan_requests,
    update_loan_request, get_loan_by_reference
)
from app.services.workflow_engine import (
    process_full_workflow, approve_or_reject, get_workflow_history
)
from app.services.audit_service import log_action, extract_request_metadata

router = APIRouter(prefix="/loans", tags=["Loan Requests"])


@router.post("/", response_model=LoanRequestOut, status_code=status.HTTP_201_CREATED)
async def create_request(
    data: LoanRequestCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.MAKER, UserRole.ADMIN)),
):
    loan = await create_loan_request(db, data, created_by=current_user.id)

    meta = extract_request_metadata(request)
    await log_action(
        db, action="CREATE_LOAN_REQUEST", entity_type="LoanRequest",
        entity_id=loan.id, user_id=current_user.id, loan_request_id=loan.id,
        new_values={"reference": loan.reference_number, "amount": loan.loan_amount},
        ip_address=meta["ip_address"]
    )

    # Auto-process workflow
    loan = await process_full_workflow(db, loan)
    return LoanRequestOut.model_validate(loan)


@router.get("/", response_model=PaginatedResponse)
async def list_requests(
    status: Optional[WorkflowState] = Query(None),
    risk_level: Optional[RiskLevel] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    skip = (page - 1) * size
    # MAKER only sees their own requests
    created_by_filter = None
    if current_user.role == UserRole.MAKER:
        created_by_filter = current_user.id

    loans, total = await get_all_loan_requests(
        db, status=status, created_by=created_by_filter,
        risk_level=risk_level, skip=skip, limit=size
    )
    pages = math.ceil(total / size) if total > 0 else 1
    return PaginatedResponse(
        items=[LoanRequestOut.model_validate(l) for l in loans],
        total=total, page=page, size=size, pages=pages
    )


@router.get("/{loan_id}", response_model=LoanRequestOut)
async def get_request(
    loan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    loan = await get_loan_request_by_id(db, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan request not found")
    if current_user.role == UserRole.MAKER and loan.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return LoanRequestOut.model_validate(loan)


@router.get("/ref/{reference}", response_model=LoanRequestOut)
async def get_by_reference(
    reference: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    loan = await get_loan_by_reference(db, reference)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan request not found")
    if current_user.role == UserRole.MAKER and loan.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return LoanRequestOut.model_validate(loan)


@router.patch("/{loan_id}", response_model=LoanRequestOut)
async def update_request(
    loan_id: int,
    data: LoanRequestUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.MAKER, UserRole.ADMIN)),
):
    loan = await get_loan_request_by_id(db, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan request not found")
    if current_user.role == UserRole.MAKER and loan.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    old_vals = {"amount": loan.loan_amount, "salary": loan.monthly_salary}
    loan = await update_loan_request(db, loan, data)

    meta = extract_request_metadata(request)
    await log_action(
        db, action="UPDATE_LOAN_REQUEST", entity_type="LoanRequest",
        entity_id=loan.id, user_id=current_user.id, loan_request_id=loan.id,
        old_values=old_vals, new_values=data.model_dump(exclude_unset=True),
        ip_address=meta["ip_address"]
    )
    return LoanRequestOut.model_validate(loan)


@router.post("/{loan_id}/action", response_model=LoanRequestOut)
async def approval_action(
    loan_id: int,
    action_data: ApprovalAction,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.APPROVER, UserRole.ADMIN)),
):
    loan = await get_loan_request_by_id(db, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan request not found")

    try:
        loan = await approve_or_reject(
            db, loan,
            action=action_data.action,
            approver=current_user,
            reason=action_data.reason,
            override_reason=action_data.override_reason,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return LoanRequestOut.model_validate(loan)


@router.get("/{loan_id}/workflow", response_model=list[WorkflowLogOut])
async def get_workflow_history_endpoint(
    loan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    loan = await get_loan_request_by_id(db, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan request not found")
    if current_user.role == UserRole.MAKER and loan.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    logs = await get_workflow_history(db, loan_id)
    return [WorkflowLogOut.model_validate(l) for l in logs]


@router.post("/{loan_id}/reprocess", response_model=LoanRequestOut)
async def reprocess_workflow(
    loan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.CHECKER, UserRole.ADMIN)),
):
    """Force re-run workflow from INITIATED state (Admin/Checker only)."""
    loan = await get_loan_request_by_id(db, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan request not found")
    if loan.status in [WorkflowState.APPROVED, WorkflowState.REJECTED]:
        raise HTTPException(status_code=400, detail="Cannot reprocess a finalized request without override")

    loan.status = WorkflowState.INITIATED
    loan = await process_full_workflow(db, loan)
    return LoanRequestOut.model_validate(loan)
