from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth_dependencies import get_admin_user
from app.schemas.admin import (
    AdminDashboardResponse,
    AdminUserStatusUpdateRequest,
    AdminUserStatusUpdateResponse,
    AdminUsersListResponse,
)
from app.services.admin_service import get_admin_dashboard, get_admin_users, update_user_active_state

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=AdminDashboardResponse)
def read_admin_dashboard(
    db: Session = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    return get_admin_dashboard(db)


@router.get("/users", response_model=AdminUsersListResponse)
def read_admin_users(
    q: str | None = Query(default=None),
    status: Literal["all", "active", "suspended"] = Query(default="all"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    return get_admin_users(
        db=db,
        q=q,
        status=status,
        page=page,
        page_size=page_size,
    )


@router.patch("/users/{user_id}/status", response_model=AdminUserStatusUpdateResponse)
def patch_admin_user_status(
    user_id: int,
    payload: AdminUserStatusUpdateRequest,
    db: Session = Depends(get_db),
    admin_user=Depends(get_admin_user),
):
    return update_user_active_state(
        db=db,
        admin_user_id=admin_user.id,
        user_id=user_id,
        is_active=payload.is_active,
    )