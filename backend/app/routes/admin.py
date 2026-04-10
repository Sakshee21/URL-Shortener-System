from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth_dependencies import get_admin_user
from app.schemas.admin import AdminDashboardResponse
from app.services.admin_service import get_admin_dashboard

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=AdminDashboardResponse)
def read_admin_dashboard(
    db: Session = Depends(get_db),
    _admin=Depends(get_admin_user),
):
    return get_admin_dashboard(db)