from uuid import uuid4
from datetime import datetime
from urllib.parse import urlparse

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import BASE_URL
from app.models.url import URL

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

    return "".join(reversed(encoded))


def _get_existing_url(db: Session, original_url: str) -> URL | None:
    return db.query(URL).filter(URL.original_url == original_url).first()


def create_short_url(db: Session, original_url: str, user_id: int | None = None) -> URL:
    validated_url = validate_original_url(original_url)

    existing_url = _get_existing_url(db, validated_url)
    if existing_url:
        # Attach ownership when a guest-created URL is first reused by an authenticated user.
        if user_id and existing_url.user_id is None:
            existing_url.user_id = user_id
            db.commit()
            db.refresh(existing_url)

        return existing_url

    temp_code = f"tmp_{uuid4().hex}"
    url_entry = URL(original_url=validated_url, short_code=temp_code, user_id=user_id)

    db.add(url_entry)
    db.commit()
    db.refresh(url_entry)

    url_entry.short_code = encode_base62(url_entry.id)

    db.commit()
    db.refresh(url_entry)

    return url_entry


def build_short_url(short_code: str) -> str:
    return f"{BASE_URL.rstrip('/')}/{short_code}"


def get_original_url_by_short_code(db: Session, short_code: str) -> str:
    url_entry = db.query(URL).filter(URL.short_code == short_code).first()

    if not url_entry:
        raise HTTPException(status_code=404, detail="Short URL not found")

    url_entry.click_count += 1
    url_entry.last_accessed_at = datetime.utcnow()
    db.commit()

    return url_entry.original_url


def get_urls_by_user_id(db: Session, user_id: int) -> list[URL]:
    return (
        db.query(URL)
        .filter(URL.user_id == user_id)
        .order_by(URL.created_at.desc())
        .all()
    )
