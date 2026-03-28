from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth_dependencies import get_current_user, get_optional_current_user
from app.schemas.url import URLCreate, URLCreateResponse, URLListItemResponse
from app.services.url_service import (
    build_short_url,
    create_short_url,
    get_urls_by_user_id,
    get_original_url_by_short_code,
)

router = APIRouter(tags=["URL Shortener"])


@router.post("/urls", response_model=URLCreateResponse)
def shorten_url(
    payload: URLCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_current_user),
):
    user_id = current_user.id if current_user else None
    url_entry = create_short_url(db=db, original_url=payload.original_url, user_id=user_id)

    return URLCreateResponse(
        short_code=url_entry.short_code,
        short_url=build_short_url(url_entry.short_code),
        original_url=url_entry.original_url,
        created_at=url_entry.created_at,
        user_id=url_entry.user_id,
    )


@router.get("/urls/me", response_model=list[URLListItemResponse])
def get_my_urls(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    urls = get_urls_by_user_id(db=db, user_id=current_user.id)
    return [
        URLListItemResponse(
            id=url.id,
            short_code=url.short_code,
            short_url=build_short_url(url.short_code),
            original_url=url.original_url,
            created_at=url.created_at,
        )
        for url in urls
    ]


@router.get("/{short_code}")
def redirect_to_original(short_code: str, db: Session = Depends(get_db)):
    original_url = get_original_url_by_short_code(db=db, short_code=short_code)
    return RedirectResponse(url=original_url)
