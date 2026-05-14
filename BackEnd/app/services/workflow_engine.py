"""
Workflow Engine - manages state transitions for loan requests.
States: INITIATED → VALIDATED → RULE_CHECKED → RISK_ASSESSED → APPROVED / REJECTED
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.models import (
    LoanRequest, WorkflowLog, WorkflowState, User
)
from app.services.validation_service import run_full_validation
from app.services.rules_engine import run_business_rules
from app.services.risk_service import compute_risk_score, compute_dti
from app.services.notification_service import notify_workflow_transition
from app.services.audit_service import log_action


async def _add_workflow_log(
    db: AsyncSession,
    loan_request_id: int,
    from_state: Optional[WorkflowState],
    to_state: WorkflowState,
    reason: Optional[str] = None,
    transitioned_by: Optional[int] = None,
    metadata: Optional[dict] = None,
):
    log = WorkflowLog(
        loan_request_id=loan_request_id,
        from_state=from_state,
        to_state=to_state,
        transitioned_by=transitioned_by,
        transition_reason=reason,
        metadata_=metadata,
    )
    db.add(log)
    await db.flush()
    return log


async def _get_all_admin_checker_ids(db: AsyncSession) -> List[int]:
    result = await db.execute(
        select(User.id).where(
            User.role.in_(["CHECKER", "APPROVER", "ADMIN"]),
            User.is_active == True
        )
    )
    return result.scalars().all()


async def transition_to_validated(
    db: AsyncSession,
    loan_request: LoanRequest,
) -> LoanRequest:
    """INITIATED → VALIDATED: Run input validation."""
    if loan_request.status != WorkflowState.INITIATED:
        raise ValueError(f"Cannot validate from state {loan_request.status}")

    passed, errors = run_full_validation(
        national_id=loan_request.national_id,
        monthly_salary=loan_request.monthly_salary,
        loan_amount=loan_request.loan_amount,
        tenure_months=loan_request.loan_tenure_months,
    )

    old_status = loan_request.status
    loan_request.validation_passed = passed
    loan_request.validation_errors = errors

    if passed:
        loan_request.status = WorkflowState.VALIDATED
        await _add_workflow_log(db, loan_request.id, old_status, WorkflowState.VALIDATED, "Validation passed automatically")
    else:
        loan_request.status = WorkflowState.REJECTED
        loan_request.rejection_reason = f"Validation failed: {'; '.join(errors)}"
        await _add_workflow_log(db, loan_request.id, old_status, WorkflowState.REJECTED, f"Validation failed: {len(errors)} error(s)")

    await db.flush()

    notify_ids = await _get_all_admin_checker_ids(db)
    notify_ids.append(loan_request.created_by)
    await notify_workflow_transition(db, loan_request, loan_request.status.value, list(set(notify_ids)))

    await log_action(
        db, action="WORKFLOW_TRANSITION", entity_type="LoanRequest",
        entity_id=loan_request.id, loan_request_id=loan_request.id,
        old_values={"status": old_status.value},
        new_values={"status": loan_request.status.value, "validation_passed": passed}
    )
    return loan_request


async def transition_to_rule_checked(
    db: AsyncSession,
    loan_request: LoanRequest,
) -> LoanRequest:
    """VALIDATED → RULE_CHECKED: Run business rules."""
    if loan_request.status != WorkflowState.VALIDATED:
        raise ValueError(f"Cannot run rules from state {loan_request.status}")

    rules_passed, eligibility_score, rules_details = run_business_rules(
        monthly_salary=loan_request.monthly_salary,
        loan_amount=loan_request.loan_amount,
        tenure_months=loan_request.loan_tenure_months,
        employment_type=loan_request.employment_type,
    )

    old_status = loan_request.status
    loan_request.rules_passed = rules_passed
    loan_request.rules_details = rules_details
    loan_request.eligibility_score = eligibility_score

    if rules_passed:
        loan_request.status = WorkflowState.RULE_CHECKED
        await _add_workflow_log(db, loan_request.id, old_status, WorkflowState.RULE_CHECKED, f"Business rules passed (score: {eligibility_score})")
    else:
        loan_request.status = WorkflowState.REJECTED
        critical = rules_details.get("critical_failures", [])
        loan_request.rejection_reason = f"Business rules failed: {', '.join(critical)}"
        await _add_workflow_log(db, loan_request.id, old_status, WorkflowState.REJECTED, f"Critical rules failed: {critical}")

    await db.flush()

    notify_ids = await _get_all_admin_checker_ids(db)
    notify_ids.append(loan_request.created_by)
    await notify_workflow_transition(db, loan_request, loan_request.status.value, list(set(notify_ids)))

    await log_action(
        db, action="WORKFLOW_TRANSITION", entity_type="LoanRequest",
        entity_id=loan_request.id, loan_request_id=loan_request.id,
        old_values={"status": old_status.value},
        new_values={"status": loan_request.status.value, "eligibility_score": eligibility_score}
    )
    return loan_request


async def transition_to_risk_assessed(
    db: AsyncSession,
    loan_request: LoanRequest,
) -> LoanRequest:
    """RULE_CHECKED → RISK_ASSESSED: Compute risk score."""
    if loan_request.status != WorkflowState.RULE_CHECKED:
        raise ValueError(f"Cannot assess risk from state {loan_request.status}")

    risk_score, risk_level = compute_risk_score(
        monthly_salary=loan_request.monthly_salary,
        loan_amount=loan_request.loan_amount,
        tenure_months=loan_request.loan_tenure_months,
        employment_type=loan_request.employment_type,
        eligibility_score=loan_request.eligibility_score or 0,
    )
    dti = compute_dti(loan_request.loan_amount, loan_request.monthly_salary, loan_request.loan_tenure_months)

    old_status = loan_request.status
    loan_request.risk_score = risk_score
    loan_request.risk_level = risk_level
    loan_request.debt_to_income_ratio = dti
    loan_request.status = WorkflowState.RISK_ASSESSED

    await _add_workflow_log(
        db, loan_request.id, old_status, WorkflowState.RISK_ASSESSED,
        f"Risk assessed: {risk_level.value} (score: {risk_score})",
        metadata={"risk_score": risk_score, "risk_level": risk_level.value, "dti": dti}
    )
    await db.flush()

    notify_ids = await _get_all_admin_checker_ids(db)
    notify_ids.append(loan_request.created_by)
    await notify_workflow_transition(db, loan_request, WorkflowState.RISK_ASSESSED.value, list(set(notify_ids)))

    await log_action(
        db, action="WORKFLOW_TRANSITION", entity_type="LoanRequest",
        entity_id=loan_request.id, loan_request_id=loan_request.id,
        old_values={"status": old_status.value},
        new_values={"status": WorkflowState.RISK_ASSESSED.value, "risk_score": risk_score, "risk_level": risk_level.value}
    )
    return loan_request


async def process_full_workflow(
    db: AsyncSession,
    loan_request: LoanRequest,
) -> LoanRequest:
    """Run all automatic transitions from INITIATED to RISK_ASSESSED."""
    if loan_request.status == WorkflowState.INITIATED:
        loan_request = await transition_to_validated(db, loan_request)
    if loan_request.status == WorkflowState.VALIDATED:
        loan_request = await transition_to_rule_checked(db, loan_request)
    if loan_request.status == WorkflowState.RULE_CHECKED:
        loan_request = await transition_to_risk_assessed(db, loan_request)
    return loan_request


async def approve_or_reject(
    db: AsyncSession,
    loan_request: LoanRequest,
    action: str,
    approver: User,
    reason: Optional[str] = None,
    override_reason: Optional[str] = None,
) -> LoanRequest:
    """Manual APPROVED / REJECTED by Approver/Admin."""
    if loan_request.status not in [WorkflowState.RISK_ASSESSED]:
        if not override_reason:
            raise ValueError(
                f"Cannot manually act on request in state {loan_request.status}. "
                "Provide override_reason to force action."
            )

    old_status = loan_request.status
    if action == "APPROVE":
        loan_request.status = WorkflowState.APPROVED
        loan_request.approved_by = approver.id
        loan_request.approved_at = datetime.utcnow()
        if override_reason:
            loan_request.override_reason = override_reason
    else:
        loan_request.status = WorkflowState.REJECTED
        loan_request.rejection_reason = reason or "Rejected by approver"
        if override_reason:
            loan_request.override_reason = override_reason

    await _add_workflow_log(
        db, loan_request.id, old_status, loan_request.status,
        reason=reason or override_reason,
        transitioned_by=approver.id,
        metadata={"override": bool(override_reason)}
    )
    await db.flush()

    notify_ids = [loan_request.created_by, approver.id]
    await notify_workflow_transition(db, loan_request, loan_request.status.value, list(set(notify_ids)))

    await log_action(
        db, action=f"MANUAL_{action}", entity_type="LoanRequest",
        entity_id=loan_request.id, user_id=approver.id,
        loan_request_id=loan_request.id,
        old_values={"status": old_status.value},
        new_values={"status": loan_request.status.value, "reason": reason, "override": bool(override_reason)}
    )
    return loan_request


async def get_workflow_history(db: AsyncSession, loan_request_id: int) -> List[WorkflowLog]:
    result = await db.execute(
        select(WorkflowLog)
        .where(WorkflowLog.loan_request_id == loan_request_id)
        .order_by(WorkflowLog.created_at.asc())
    )
    return result.scalars().all()
