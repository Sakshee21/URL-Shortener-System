from uuid import uuid4
from typing import Literal
from urllib.parse import urlparse

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import BASE_URL, MIN_SHORT_CODE_LENGTH
from app.models.url import URL
from app.services.preview_service import fetch_preview_metadata
from app.services.security_service import assert_url_not_blacklisted, score_url_risk

BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"


def validate_original_url(original_url: str) -> str:
    cleaned_url = original_url.strip()
    parsed = urlparse(cleaned_url)

    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid URL. Use http:// or https://")

    scheme = parsed.scheme.lower()
    hostname = (parsed.hostname or "").lower()
    port = parsed.port

    # Normalize default ports to avoid duplicate records for equivalent URLs.
    if (scheme == "http" and port in (None, 80)) or (scheme == "https" and port in (None, 443)):
        netloc = hostname
    elif port:
        netloc = f"{hostname}:{port}"
    else:
        netloc = hostname

    path = parsed.path or ""
    if path != "/" and path.endswith("/"):
        path = path.rstrip("/")

    return parsed._replace(scheme=scheme, netloc=netloc, path=path, fragment="").geturl()


def encode_base62(value: int) -> str:
    if value == 0:
        return BASE62_ALPHABET[0]

    encoded: list[str] = []
    base = len(BASE62_ALPHABET)

    while value > 0:
        value, remainder = divmod(value, base)
        encoded.append(BASE62_ALPHABET[remainder])

    encoded_value = "".join(reversed(encoded))
    return encoded_value.rjust(MIN_SHORT_CODE_LENGTH, BASE62_ALPHABET[0])


def _get_existing_url(db: Session, original_url: str) -> URL | None:
    return db.query(URL).filter(URL.original_url == original_url).first()


def create_short_url(db: Session, original_url: str, user_id: int | None = None) -> URL:
    validated_url = validate_original_url(original_url)
    parsed = urlparse(validated_url)

    assert_url_not_blacklisted(validated_url)
    risk_score, risk_level = score_url_risk(validated_url)
    preview = fetch_preview_metadata(validated_url)

    if not preview.get("page_title"):
        preview["page_title"] = parsed.netloc

    existing_url = _get_existing_url(db, validated_url)
    if existing_url:
        updated = False

        if not existing_url.is_active:
            existing_url.is_active = True
            updated = True

        # Attach ownership when a guest-created URL is first reused by an authenticated user.
        if user_id and existing_url.user_id is None:
            existing_url.user_id = user_id
            updated = True

        if existing_url.risk_score != risk_score or existing_url.risk_level != risk_level:
            existing_url.risk_score = risk_score
            existing_url.risk_level = risk_level
            updated = True

        # Fill missing metadata progressively for older records.
        if not existing_url.page_title and preview.get("page_title"):
            existing_url.page_title = preview["page_title"]
            updated = True
        if not existing_url.page_description and preview.get("page_description"):
            existing_url.page_description = preview["page_description"]
            updated = True
        if not existing_url.favicon_url and preview.get("favicon_url"):
            existing_url.favicon_url = preview["favicon_url"]
            updated = True
        if not existing_url.preview_image_url and preview.get("preview_image_url"):
            existing_url.preview_image_url = preview["preview_image_url"]
            updated = True

        if updated:
            db.commit()
            db.refresh(existing_url)

        return existing_url

    temp_code = f"tmp_{uuid4().hex}"
    url_entry = URL(
        original_url=validated_url,
        short_code=temp_code,
        user_id=user_id,
        risk_level=risk_level,
        risk_score=risk_score,
        page_title=preview.get("page_title"),
        page_description=preview.get("page_description"),
        favicon_url=preview.get("favicon_url"),
        preview_image_url=preview.get("preview_image_url"),
    )

    db.add(url_entry)
    db.commit()
    db.refresh(url_entry)

    url_entry.short_code = encode_base62(url_entry.id)

    db.commit()
    db.refresh(url_entry)

    return url_entry


def build_short_url(short_code: str) -> str:
    return f"{BASE_URL.rstrip('/')}/{short_code}"


def get_url_by_short_code(db: Session, short_code: str) -> URL:
    url_entry = db.query(URL).filter(URL.short_code == short_code, URL.is_active.is_(True)).first()

    if not url_entry:
        raise HTTPException(status_code=404, detail="Short URL not found")

    return url_entry


def get_urls_by_user_id(db: Session, user_id: int) -> list[URL]:
    return get_urls_by_user_id_with_status(db=db, user_id=user_id, status="all")


def get_urls_by_user_id_with_status(
    db: Session,
    user_id: int,
    status: Literal["all", "active", "inactive"] = "all",
) -> list[URL]:
    query = db.query(URL).filter(URL.user_id == user_id)

    if status == "active":
        query = query.filter(URL.is_active.is_(True))
    elif status == "inactive":
        query = query.filter(URL.is_active.is_(False))

    return query.order_by(URL.created_at.desc()).all()


def get_url_by_id_for_user(db: Session, url_id: int, user_id: int) -> URL:
    url_entry = db.query(URL).filter(URL.id == url_id, URL.user_id == user_id).first()

    if not url_entry:
        raise HTTPException(status_code=404, detail="Short URL not found")

    return url_entry


def set_url_active_state(db: Session, url_id: int, user_id: int, is_active: bool) -> URL:
    url_entry = get_url_by_id_for_user(db=db, url_id=url_id, user_id=user_id)
    url_entry.is_active = is_active
    db.commit()
    db.refresh(url_entry)
    return url_entry


def soft_delete_url(db: Session, url_id: int, user_id: int) -> URL:
    return set_url_active_state(db=db, url_id=url_id, user_id=user_id, is_active=False)
