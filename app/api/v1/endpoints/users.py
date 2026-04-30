from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user, require_roles
from app.models.models import UserRole
from app.schemas.schemas import UserCreate, UserUpdate, UserOut
from app.services.user_service import (
    create_user, get_user_by_id, get_all_users, update_user,
    get_user_by_username, get_user_by_email, deactivate_user
)
from app.services.audit_service import log_action, extract_request_metadata

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_new_user(
    user_data: UserCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN)),
):
    if await get_user_by_username(db, user_data.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    if await get_user_by_email(db, user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await create_user(db, user_data)
    meta = extract_request_metadata(request)
    await log_action(
        db, action="CREATE_USER", entity_type="User", entity_id=user.id,
        user_id=current_user.id, new_values={"username": user.username, "role": user.role.value},
        ip_address=meta["ip_address"]
    )
    return user


@router.get("/", response_model=List[UserOut])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN)),
):
    return await get_all_users(db, skip, limit)


@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserOut)
async def update_existing_user(
    user_id: int,
    update_data: UserUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN)),
):
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_vals = {"role": user.role.value, "is_active": user.is_active}
    user = await update_user(db, user, update_data)
    meta = extract_request_metadata(request)
    await log_action(
        db, action="UPDATE_USER", entity_type="User", entity_id=user.id,
        user_id=current_user.id, old_values=old_vals,
        new_values=update_data.model_dump(exclude_unset=True),
        ip_address=meta["ip_address"]
    )
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_existing_user(
    user_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN)),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await deactivate_user(db, user)
    meta = extract_request_metadata(request)
    await log_action(
        db, action="DEACTIVATE_USER", entity_type="User", entity_id=user_id,
        user_id=current_user.id, ip_address=meta["ip_address"]
    )
