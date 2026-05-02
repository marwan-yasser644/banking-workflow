from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, loans, notifications, audit, dashboard

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(loans.router)
api_router.include_router(notifications.router)
api_router.include_router(audit.router)
api_router.include_router(dashboard.router)
