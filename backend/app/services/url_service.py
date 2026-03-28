import secrets
import string
from urllib.parse import urlparse

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import BASE_URL, SHORT_CODE_LENGTH, SHORT_CODE_MAX_RETRIES
from app.models.url import URL

BASE62_ALPHABET = string.ascii_letters + string.digits


def validate_original_url(original_url: str) -> str:
    parsed = urlparse(original_url)

    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid URL. Use http:// or https://")

    return original_url


def generate_short_code(length: int = SHORT_CODE_LENGTH) -> str:
    return "".join(secrets.choice(BASE62_ALPHABET) for _ in range(length))


def _short_code_exists(db: Session, short_code: str) -> bool:
    return db.query(URL).filter(URL.short_code == short_code).first() is not None


def generate_unique_short_code(db: Session) -> str:
    for _ in range(SHORT_CODE_MAX_RETRIES):
        short_code = generate_short_code()
        if not _short_code_exists(db, short_code):
            return short_code

    raise HTTPException(status_code=500, detail="Could not generate unique short code")


def create_short_url(db: Session, original_url: str, user_id: int | None = None) -> URL:
    validated_url = validate_original_url(original_url)

    for _ in range(SHORT_CODE_MAX_RETRIES):
        short_code = generate_unique_short_code(db)
        url_entry = URL(original_url=validated_url, short_code=short_code, user_id=user_id)

        try:
            db.add(url_entry)
            db.commit()
            db.refresh(url_entry)
            return url_entry
        except IntegrityError:
            db.rollback()

    raise HTTPException(status_code=500, detail="Failed to create short URL")


def build_short_url(short_code: str) -> str:
    return f"{BASE_URL.rstrip('/')}/{short_code}"


def get_original_url_by_short_code(db: Session, short_code: str) -> str:
    url_entry = db.query(URL).filter(URL.short_code == short_code).first()

    if not url_entry:
        raise HTTPException(status_code=404, detail="Short URL not found")

    return url_entry.original_url


def get_urls_by_user_id(db: Session, user_id: int) -> list[URL]:
    return (
        db.query(URL)
        .filter(URL.user_id == user_id)
        .order_by(URL.created_at.desc())
        .all()
    )
