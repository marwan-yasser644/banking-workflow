from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.core.security import get_current_user
from app.schemas.schemas import NotificationOut
from app.services.notification_service import (
    get_user_notifications, mark_notification_read, mark_all_read
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationOut])
async def list_notifications(
    unread_only: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await get_user_notifications(db, current_user.id, unread_only, skip, limit)


@router.patch("/{notification_id}/read", response_model=NotificationOut)
async def mark_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    notif = await mark_notification_read(db, notification_id, current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return NotificationOut.model_validate(notif)


@router.post("/read-all", status_code=204)
async def mark_all_as_read(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    await mark_all_read(db, current_user.id)
