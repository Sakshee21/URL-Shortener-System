from urllib.parse import urlparse
from typing import Literal

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import RedirectResponse, StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import BASE_URL, FRONTEND_BASE_URL
from app.db.session import get_db
from app.dependencies.rate_limit_dependency import rate_limit_create_url
from app.dependencies.auth_dependencies import get_current_user, get_optional_current_user
from app.schemas.url import (
    URLAnalyticsResponse,
    URLCreate,
    URLCreateResponse,
    URLListItemResponse,
    UserAnalyticsResponse,
    URLStatusUpdateRequest,
    URLStatusUpdateResponse,
    URLWarningResponse,
)
from app.services.click_service import log_click
from app.services.security_service import assert_url_not_blacklisted
from app.services.url_service import (
    build_short_url,
    create_short_url,
    export_url_analytics_csv,
    export_user_analytics_csv,
    get_url_analytics,
    get_url_by_short_code,
    get_user_analytics,
    get_urls_by_user_id_with_status,
    set_url_active_state,
    soft_delete_url,
)

router = APIRouter(tags=["URL Shortener"])


@router.post("/urls", response_model=URLCreateResponse)
def shorten_url(
    payload: URLCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_current_user),
    _=Depends(rate_limit_create_url),
):
    user_id = current_user.id if current_user else None
    url_entry = create_short_url(db=db, original_url=payload.original_url, user_id=user_id)

    return URLCreateResponse(
        id=url_entry.id,
        short_code=url_entry.short_code,
        short_url=build_short_url(url_entry.short_code),
        original_url=url_entry.original_url,
        created_at=url_entry.created_at,
        user_id=url_entry.user_id,
        risk_level=url_entry.risk_level,
        risk_score=url_entry.risk_score,
    )


@router.get("/urls/me", response_model=list[URLListItemResponse])
def get_my_urls(
    status: Literal["all", "active", "inactive"] = Query(default="all"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    urls = get_urls_by_user_id_with_status(db=db, user_id=current_user.id, status=status)
    return [
        URLListItemResponse(
            id=url.id,
            short_code=url.short_code,
            short_url=build_short_url(url.short_code),
            original_url=url.original_url,
            created_at=url.created_at,
            click_count=url.click_count,
            unique_click_count=url.unique_click_count,
            last_accessed_at=url.last_accessed_at,
            risk_level=url.risk_level,
            risk_score=url.risk_score,
            is_active=url.is_active,
        )
        for url in urls
    ]


@router.delete("/urls/{url_id}", response_model=URLStatusUpdateResponse)
def delete_my_url(
    url_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    url_entry = soft_delete_url(db=db, url_id=url_id, user_id=current_user.id)
    return URLStatusUpdateResponse(id=url_entry.id, is_active=url_entry.is_active)


@router.patch("/urls/{url_id}/status", response_model=URLStatusUpdateResponse)
def update_my_url_status(
    url_id: int,
    payload: URLStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    url_entry = set_url_active_state(
        db=db,
        url_id=url_id,
        user_id=current_user.id,
        is_active=payload.is_active,
    )
    return URLStatusUpdateResponse(id=url_entry.id, is_active=url_entry.is_active)


@router.get("/urls/me/analytics", response_model=UserAnalyticsResponse)
def get_my_analytics(
    range: Literal["7d", "30d", "90d"] = Query(default="30d"),
    include_comparison: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_user_analytics(
        db=db,
        user_id=current_user.id,
        range_value=range,
        include_comparison=include_comparison,
    )


@router.get("/urls/{url_id}/analytics", response_model=URLAnalyticsResponse)
def get_link_analytics(
    url_id: int,
    range: Literal["7d", "30d", "90d"] = Query(default="30d"),
    include_comparison: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_url_analytics(
        db=db,
        user_id=current_user.id,
        url_id=url_id,
        range_value=range,
        include_comparison=include_comparison,
    )


@router.get("/urls/me/analytics/export")
def export_my_analytics(
    range: Literal["7d", "30d", "90d"] = Query(default="30d"),
    include_comparison: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    csv_text = export_user_analytics_csv(
        db=db,
        user_id=current_user.id,
        range_value=range,
        include_comparison=include_comparison,
    )
    filename = f"analytics-all-{range}.csv"
    return StreamingResponse(
        iter([csv_text]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/urls/{url_id}/analytics/export")
def export_link_analytics(
    url_id: int,
    range: Literal["7d", "30d", "90d"] = Query(default="30d"),
    include_comparison: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    csv_text = export_url_analytics_csv(
        db=db,
        user_id=current_user.id,
        url_id=url_id,
        range_value=range,
        include_comparison=include_comparison,
    )
    filename = f"analytics-link-{url_id}-{range}.csv"
    return StreamingResponse(
        iter([csv_text]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/urls/preview/{short_code}", response_model=URLWarningResponse)
def get_warning_preview(short_code: str, db: Session = Depends(get_db)):
    url_entry = get_url_by_short_code(db=db, short_code=short_code)
    assert_url_not_blacklisted(url_entry.original_url)
    parsed = urlparse(url_entry.original_url)

    return URLWarningResponse(
        short_code=url_entry.short_code,
        original_url=url_entry.original_url,
        domain=parsed.netloc,
        risk_level=url_entry.risk_level,
        risk_score=url_entry.risk_score,
        page_title=url_entry.page_title,
        page_description=url_entry.page_description,
        favicon_url=url_entry.favicon_url,
        preview_image_url=url_entry.preview_image_url,
        continue_url=f"{BASE_URL.rstrip('/')}/urls/{url_entry.short_code}/go",
    )


@router.get("/urls/{short_code}/go")
def continue_to_original(short_code: str, request: Request, db: Session = Depends(get_db)):
    url_entry = get_url_by_short_code(db=db, short_code=short_code)
    assert_url_not_blacklisted(url_entry.original_url)
    log_click(db=db, url_entry=url_entry, request=request)
    return RedirectResponse(url=url_entry.original_url)


@router.get("/{short_code}")
def redirect_to_original(short_code: str, db: Session = Depends(get_db)):
    url_entry = get_url_by_short_code(db=db, short_code=short_code)
    assert_url_not_blacklisted(url_entry.original_url)
    warning_url = f"{FRONTEND_BASE_URL.rstrip('/')}/preview/{short_code}"
    return RedirectResponse(url=warning_url)
