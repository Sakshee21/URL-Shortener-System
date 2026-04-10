from collections import defaultdict
from datetime import datetime, timedelta
from math import ceil

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import BASE_URL
from app.models.click import Click
from app.models.url import URL
from app.models.user import User


def _build_weekly_growth(users: list[User], weeks: int = 8) -> list[dict]:
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=weeks * 7)

    buckets: list[dict] = []
    for index in range(weeks):
        bucket_start = start_date + timedelta(days=index * 7)
        bucket_end = bucket_start + timedelta(days=7)
        count = 0

        for user in users:
            created_at = user.created_at or datetime.utcnow()
            created_date = created_at.date()
            if bucket_start <= created_date < bucket_end:
                count += 1

        buckets.append({"label": f"W{index + 1}", "value": count})

    return buckets


def _build_activity_feed(users: list[User], urls: list[URL], clicks: list[Click], limit: int = 10) -> list[dict]:
    items: list[dict] = []

    for user in users:
        if not user.created_at:
            continue

        items.append(
            {
                "type": "signup",
                "message": f"New user registered: {user.email}",
                "timestamp": user.created_at,
            }
        )

    for url_entry in urls:
        items.append(
            {
                "type": "link_created",
                "message": f"Link created: {url_entry.short_code} by {url_entry.owner.email if url_entry.owner else 'Guest'}",
                "timestamp": url_entry.created_at,
            }
        )

    for click in clicks:
        url_entry = click.url
        if not url_entry:
            continue

        items.append(
            {
                "type": "click",
                "message": f"Click recorded on {url_entry.short_code}",
                "timestamp": click.timestamp,
            }
        )

    items.sort(key=lambda item: item["timestamp"], reverse=True)
    return items[:limit]


def get_admin_dashboard(db: Session) -> dict:
    users = db.query(User).order_by(User.created_at.desc()).all()
    urls = db.query(URL).order_by(URL.created_at.desc()).all()
    clicks = db.query(Click).order_by(Click.timestamp.desc()).all()

    click_counts_by_url = dict(db.query(Click.url_id, func.count(Click.id)).group_by(Click.url_id).all())

    total_links_by_user = defaultdict(int)
    total_clicks_by_user = defaultdict(int)
    for url_entry in urls:
        owner_id = url_entry.user_id
        if owner_id is None:
            continue

        total_links_by_user[owner_id] += 1
        total_clicks_by_user[owner_id] += click_counts_by_url.get(url_entry.id, 0)

    recent_users = [
        {
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at,
            "total_links": total_links_by_user.get(user.id, 0),
            "total_clicks": total_clicks_by_user.get(user.id, 0),
            "is_admin": user.is_admin,
            "is_active": user.is_active,
        }
        for user in users[:6]
    ]

    recent_links = [
        {
            "id": url_entry.id,
            "short_code": url_entry.short_code,
            "short_url": f"{BASE_URL.rstrip('/')}/{url_entry.short_code}",
            "original_url": url_entry.original_url,
            "owner_email": url_entry.owner.email if url_entry.owner else None,
            "created_at": url_entry.created_at,
            "click_count": click_counts_by_url.get(url_entry.id, 0),
            "is_active": url_entry.is_active,
            "risk_level": url_entry.risk_level,
        }
        for url_entry in urls[:6]
    ]

    return {
        "total_users": len(users),
        "total_links": len(urls),
        "total_clicks": len(clicks),
        "active_links": sum(1 for url_entry in urls if url_entry.is_active),
        "user_growth": _build_weekly_growth(users),
        "recent_users": recent_users,
        "recent_links": recent_links,
        "recent_activity": _build_activity_feed(users, urls, clicks),
    }


def get_admin_users(
    db: Session,
    q: str | None,
    status: str,
    page: int,
    page_size: int,
) -> dict:
    users_query = db.query(User)

    if q:
        users_query = users_query.filter(User.email.ilike(f"%{q.strip()}%"))

    if status == "active":
        users_query = users_query.filter(User.is_active.is_(True))
    elif status == "suspended":
        users_query = users_query.filter(User.is_active.is_(False))

    total_items = users_query.count()
    total_pages = max(1, ceil(total_items / page_size)) if total_items else 1
    safe_page = min(page, total_pages)

    users = (
        users_query
        .order_by(User.created_at.desc())
        .offset((safe_page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    user_ids = [user.id for user in users]
    link_counts_by_user = dict(
        db.query(URL.user_id, func.count(URL.id))
        .filter(URL.user_id.in_(user_ids))
        .group_by(URL.user_id)
        .all()
    ) if user_ids else {}

    click_counts_by_user = dict(
        db.query(URL.user_id, func.count(Click.id))
        .join(Click, Click.url_id == URL.id)
        .filter(URL.user_id.in_(user_ids))
        .group_by(URL.user_id)
        .all()
    ) if user_ids else {}

    items = [
        {
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at,
            "total_links": int(link_counts_by_user.get(user.id, 0)),
            "total_clicks": int(click_counts_by_user.get(user.id, 0)),
            "is_admin": user.is_admin,
            "is_active": user.is_active,
        }
        for user in users
    ]

    return {
        "items": items,
        "page": safe_page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
    }


def update_user_active_state(db: Session, admin_user_id: int, user_id: int, is_active: bool) -> dict:
    target_user = db.query(User).filter(User.id == user_id).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if target_user.id == admin_user_id:
        raise HTTPException(status_code=400, detail="You cannot change your own account status")

    if target_user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot change status for another admin")

    target_user.is_active = is_active
    db.commit()
    db.refresh(target_user)

    return {"id": target_user.id, "is_active": target_user.is_active}