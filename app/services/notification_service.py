from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from app.models.models import Notification, NotificationType, User, LoanRequest


async def create_notification(
    db: AsyncSession,
    user_id: int,
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.INFO,
    loan_request_id: Optional[int] = None,
) -> Notification:
    notif = Notification(
        user_id=user_id,
        loan_request_id=loan_request_id,
        title=title,
        message=message,
        notification_type=notification_type,
    )
    db.add(notif)
    await db.flush()
    return notif


async def notify_workflow_transition(
    db: AsyncSession,
    loan_request: LoanRequest,
    new_status: str,
    relevant_user_ids: List[int],
):
    status_messages = {
        "VALIDATED": ("Request Validated ✓", f"Loan request {loan_request.reference_number} passed validation.", NotificationType.INFO),
        "RULE_CHECKED": ("Rules Checked ✓", f"Loan request {loan_request.reference_number} passed business rules check.", NotificationType.INFO),
        "RISK_ASSESSED": ("Risk Assessed ✓", f"Loan request {loan_request.reference_number} risk assessed as {loan_request.risk_level}.", NotificationType.WARNING if loan_request.risk_level == "HIGH" else NotificationType.INFO),
        "APPROVED": ("Loan Approved ✓", f"Loan request {loan_request.reference_number} has been APPROVED.", NotificationType.SUCCESS),
        "REJECTED": ("Loan Rejected ✗", f"Loan request {loan_request.reference_number} has been REJECTED.", NotificationType.ERROR),
    }
    title, message, ntype = status_messages.get(new_status, ("Update", f"Request {loan_request.reference_number} updated.", NotificationType.INFO))
    for uid in relevant_user_ids:
        await create_notification(db, uid, title, message, ntype, loan_request.id)


async def get_user_notifications(
    db: AsyncSession,
    user_id: int,
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 50,
) -> List[Notification]:
    query = select(Notification).where(Notification.user_id == user_id)
    if unread_only:
        query = query.where(Notification.is_read == False)
    query = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def mark_notification_read(db: AsyncSession, notification_id: int, user_id: int) -> Optional[Notification]:
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
    )
    notif = result.scalar_one_or_none()
    if notif:
        notif.is_read = True
        await db.flush()
    return notif


async def mark_all_read(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(Notification).where(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
    )
    notifs = result.scalars().all()
    for n in notifs:
        n.is_read = True
    await db.flush()
