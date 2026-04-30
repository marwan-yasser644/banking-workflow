from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.session import get_db
from app.core.security import require_roles
from app.models.models import UserRole
from app.schemas.schemas import AuditLogOut
from app.services.audit_service import get_audit_logs

router = APIRouter(prefix="/audit", tags=["Audit Logs"])


@router.get("/", response_model=List[AuditLogOut])
async def list_audit_logs(
    loan_request_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    entity_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN, UserRole.CHECKER, UserRole.APPROVER)),
):
    logs = await get_audit_logs(db, loan_request_id, user_id, entity_type, skip, limit)
    return [AuditLogOut.model_validate(l) for l in logs]
