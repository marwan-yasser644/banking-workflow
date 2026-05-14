import uuid
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.models.models import LoanRequest, WorkflowState, RiskLevel
from app.schemas.schemas import LoanRequestCreate, LoanRequestUpdate


def _generate_reference() -> str:
    return f"LN-{uuid.uuid4().hex[:8].upper()}"


async def create_loan_request(
    db: AsyncSession,
    data: LoanRequestCreate,
    created_by: int,
) -> LoanRequest:
    loan = LoanRequest(
        reference_number=_generate_reference(),
        applicant_name=data.applicant_name,
        national_id=data.national_id,
        email=data.email,
        phone=data.phone,
        monthly_salary=data.monthly_salary,
        employment_type=data.employment_type,
        loan_amount=data.loan_amount,
        loan_tenure_months=data.loan_tenure_months,
        loan_purpose=data.loan_purpose,
        created_by=created_by,
        status=WorkflowState.INITIATED,
    )
    db.add(loan)
    await db.flush()
    await db.refresh(loan)
    return loan


async def get_loan_request_by_id(db: AsyncSession, loan_id: int) -> Optional[LoanRequest]:
    result = await db.execute(select(LoanRequest).where(LoanRequest.id == loan_id))
    return result.scalar_one_or_none()


async def get_loan_by_reference(db: AsyncSession, reference: str) -> Optional[LoanRequest]:
    result = await db.execute(
        select(LoanRequest).where(LoanRequest.reference_number == reference)
    )
    return result.scalar_one_or_none()


async def get_all_loan_requests(
    db: AsyncSession,
    status: Optional[WorkflowState] = None,
    created_by: Optional[int] = None,
    risk_level: Optional[RiskLevel] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[LoanRequest], int]:
    query = select(LoanRequest)
    count_query = select(func.count(LoanRequest.id))

    filters = []
    if status:
        filters.append(LoanRequest.status == status)
    if created_by:
        filters.append(LoanRequest.created_by == created_by)
    if risk_level:
        filters.append(LoanRequest.risk_level == risk_level)

    if filters:
        query = query.where(and_(*filters))
        count_query = count_query.where(and_(*filters))

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    query = query.order_by(LoanRequest.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all(), total


async def update_loan_request(
    db: AsyncSession,
    loan: LoanRequest,
    data: LoanRequestUpdate,
) -> LoanRequest:
    if loan.status not in [WorkflowState.INITIATED]:
        raise ValueError("Can only update requests in INITIATED state")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(loan, field, value)
    await db.flush()
    await db.refresh(loan)
    return loan


async def get_dashboard_stats(db: AsyncSession) -> dict:
    total = await db.execute(select(func.count(LoanRequest.id)))
    total_count = total.scalar_one()

    by_status = {}
    for state in WorkflowState:
        r = await db.execute(
            select(func.count(LoanRequest.id)).where(LoanRequest.status == state)
        )
        by_status[state.value] = r.scalar_one()

    by_risk = {}
    for risk in RiskLevel:
        r = await db.execute(
            select(func.count(LoanRequest.id)).where(LoanRequest.risk_level == risk)
        )
        by_risk[risk.value] = r.scalar_one()

    total_vol = await db.execute(select(func.sum(LoanRequest.loan_amount)))
    total_volume = total_vol.scalar_one() or 0.0

    approved_vol = await db.execute(
        select(func.sum(LoanRequest.loan_amount)).where(LoanRequest.status == WorkflowState.APPROVED)
    )
    approved_volume = approved_vol.scalar_one() or 0.0

    avg_risk = await db.execute(select(func.avg(LoanRequest.risk_score)))
    avg_risk_score = avg_risk.scalar_one()

    approved_count = by_status.get(WorkflowState.APPROVED.value, 0)
    rejected_count = by_status.get(WorkflowState.REJECTED.value, 0)
    decided = approved_count + rejected_count
    approval_rate = (approved_count / decided * 100) if decided > 0 else 0.0

    pending_states = [WorkflowState.INITIATED, WorkflowState.VALIDATED, WorkflowState.RULE_CHECKED, WorkflowState.RISK_ASSESSED]
    pending = sum(by_status.get(s.value, 0) for s in pending_states)

    return {
        "total_requests": total_count,
        "pending_requests": pending,
        "approved_requests": approved_count,
        "rejected_requests": rejected_count,
        "total_loan_volume": round(total_volume, 2),
        "approved_loan_volume": round(approved_volume, 2),
        "approval_rate": round(approval_rate, 2),
        "avg_risk_score": round(avg_risk_score, 2) if avg_risk_score else None,
        "requests_by_status": by_status,
        "requests_by_risk": by_risk,
    }
