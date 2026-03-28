from datetime import datetime
from hashlib import sha256

from fastapi import Request
from sqlalchemy.orm import Session

from app.models.click import Click
from app.models.url import URL


def _get_ip_hash(request: Request) -> str:
    ip = request.client.host if request.client else "unknown"
    return sha256(ip.encode("utf-8")).hexdigest()


def log_click(db: Session, url_entry: URL, request: Request) -> None:
    ip_hash = _get_ip_hash(request)
    user_agent = request.headers.get("user-agent", "")

    has_previous_unique_click = (
        db.query(Click)
        .filter(Click.url_id == url_entry.id, Click.ip_hash == ip_hash)
        .first()
        is not None
    )

    click = Click(url_id=url_entry.id, ip_hash=ip_hash, user_agent=user_agent, timestamp=datetime.utcnow())
    db.add(click)

    url_entry.click_count += 1
    url_entry.last_accessed_at = datetime.utcnow()

    if not has_previous_unique_click:
        url_entry.unique_click_count += 1

    db.commit()
