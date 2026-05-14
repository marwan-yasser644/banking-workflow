from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import require_roles
from app.models.models import UserRole
from app.schemas.schemas import DashboardStats
from app.services.loan_service import get_dashboard_stats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def dashboard_statistics(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN, UserRole.CHECKER, UserRole.APPROVER)),
):
    stats = await get_dashboard_stats(db)
    return DashboardStats(**stats)
