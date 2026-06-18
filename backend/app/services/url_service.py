from collections import Counter
import csv
from datetime import datetime, timedelta
import io
import secrets
from typing import Literal
from urllib.parse import urlparse

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import BASE_URL, MIN_SHORT_CODE_LENGTH
from app.models.click import Click
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


def _generate_short_code() -> str:
    return secrets.token_urlsafe(8)


def _is_legacy_predictable_short_code(url_entry: URL) -> bool:
    return url_entry.short_code == encode_base62(url_entry.id)


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

        if _is_legacy_predictable_short_code(existing_url):
            for _ in range(8):
                existing_url.short_code = _generate_short_code()

                try:
                    db.commit()
                    db.refresh(existing_url)
                    return existing_url
                except IntegrityError:
                    db.rollback()

            raise HTTPException(status_code=500, detail="Unable to generate a unique short code")

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

    for _ in range(8):
        url_entry = URL(
            original_url=validated_url,
            short_code=_generate_short_code(),
            user_id=user_id,
            risk_level=risk_level,
            risk_score=risk_score,
            page_title=preview.get("page_title"),
            page_description=preview.get("page_description"),
            favicon_url=preview.get("favicon_url"),
            preview_image_url=preview.get("preview_image_url"),
        )

        db.add(url_entry)

        try:
            db.commit()
            db.refresh(url_entry)
            return url_entry
        except IntegrityError:
            db.rollback()

            existing_url = _get_existing_url(db, validated_url)
            if existing_url:
                return existing_url

    raise HTTPException(status_code=500, detail="Unable to generate a unique short code")


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


def _parse_device(user_agent: str) -> str:
    ua = user_agent.lower()

    if "ipad" in ua or "tablet" in ua:
        return "Tablet"
    if "mobile" in ua or "iphone" in ua or "android" in ua:
        return "Mobile"
    return "Desktop"


def _parse_browser(user_agent: str) -> str:
    ua = user_agent.lower()

    if "edg/" in ua:
        return "Edge"
    if "firefox" in ua:
        return "Firefox"
    if "chrome" in ua and "edg/" not in ua and "opr/" not in ua:
        return "Chrome"
    if "safari" in ua and "chrome" not in ua:
        return "Safari"
    return "Others"


def _range_days(range_value: Literal["7d", "30d", "90d"]) -> int:
    return {"7d": 7, "30d": 30, "90d": 90}[range_value]


def _series_template(days: int) -> dict[datetime.date, int]:
    today = datetime.utcnow().date()
    start = today - timedelta(days=days - 1)
    return {start + timedelta(days=offset): 0 for offset in range(days)}


def _build_click_series(clicks: list[Click], days: int) -> list[dict]:
    by_day = _series_template(days)

    for click in clicks:
        click_day = click.timestamp.date()
        if click_day in by_day:
            by_day[click_day] += 1

    return [
        {
            "date": day.isoformat(),
            "label": day.strftime("%a"),
            "clicks": count,
        }
        for day, count in by_day.items()
    ]


def _recent_activity(clicks: list[Click], urls_by_id: dict[int, URL], limit: int = 10) -> list[dict]:
    recent: list[dict] = []

    for click in clicks[:limit]:
        url_entry = urls_by_id.get(click.url_id)
        if not url_entry:
            continue

        recent.append(
            {
                "url_id": url_entry.id,
                "short_code": url_entry.short_code,
                "short_url": build_short_url(url_entry.short_code),
                "timestamp": click.timestamp,
                "device": _parse_device(click.user_agent or ""),
                "browser": _parse_browser(click.user_agent or ""),
            }
        )

    return recent


def _breakdown_from_clicks(clicks: list[Click], parser) -> list[dict]:
    counts = Counter(parser(click.user_agent or "") for click in clicks)
    return [{"label": label, "value": value} for label, value in counts.most_common()]


def _metric_comparison(current: float, previous: float) -> dict:
    delta = current - previous
    delta_pct = None

    if previous != 0:
        delta_pct = round((delta / previous) * 100, 2)
    elif current > 0:
        delta_pct = 100.0

    if delta > 0:
        trend = "up"
    elif delta < 0:
        trend = "down"
    else:
        trend = "flat"

    return {
        "current": round(current, 2),
        "previous": round(previous, 2),
        "delta": round(delta, 2),
        "delta_pct": delta_pct,
        "trend": trend,
    }


def _comparison_block(current_clicks: list[Click], previous_clicks: list[Click], days: int) -> dict:
    current_total = float(len(current_clicks))
    previous_total = float(len(previous_clicks))
    current_unique = float(len({click.ip_hash for click in current_clicks}))
    previous_unique = float(len({click.ip_hash for click in previous_clicks}))
    current_avg = current_total / days
    previous_avg = previous_total / days

    return {
        "total_clicks": _metric_comparison(current_total, previous_total),
        "unique_visitors": _metric_comparison(current_unique, previous_unique),
        "average_clicks_per_day": _metric_comparison(current_avg, previous_avg),
    }


def _to_csv_text(rows: list[list]) -> str:
    stream = io.StringIO()
    writer = csv.writer(stream)
    writer.writerows(rows)
    return stream.getvalue()


def get_user_analytics(
    db: Session,
    user_id: int,
    range_value: Literal["7d", "30d", "90d"],
    include_comparison: bool = False,
) -> dict:
    days = _range_days(range_value)
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=days - 1)
    start_at = datetime.combine(start_date, datetime.min.time())
    previous_start_at = start_at - timedelta(days=days)

    user_urls = db.query(URL).filter(URL.user_id == user_id).all()
    urls_by_id = {url.id: url for url in user_urls}
    url_ids = list(urls_by_id.keys())

    clicks: list[Click] = []
    if url_ids:
        clicks = (
            db.query(Click)
            .filter(Click.url_id.in_(url_ids), Click.timestamp >= start_at)
            .order_by(Click.timestamp.desc())
            .all()
        )

    previous_clicks: list[Click] = []
    if include_comparison and url_ids:
        previous_clicks = (
            db.query(Click)
            .filter(
                Click.url_id.in_(url_ids),
                Click.timestamp >= previous_start_at,
                Click.timestamp < start_at,
            )
            .order_by(Click.timestamp.desc())
            .all()
        )

    total_clicks = len(clicks)
    unique_visitors = len({click.ip_hash for click in clicks})
    average_clicks_per_day = round(total_clicks / days, 2)
    active_links = sum(1 for url in user_urls if url.is_active)

    last_accessed_url = next(
        (url for url in sorted(user_urls, key=lambda item: item.last_accessed_at or datetime.min, reverse=True) if url.last_accessed_at),
        None,
    )
    last_accessed = None
    if last_accessed_url and last_accessed_url.last_accessed_at:
        last_accessed = {
            "url_id": last_accessed_url.id,
            "short_code": last_accessed_url.short_code,
            "short_url": build_short_url(last_accessed_url.short_code),
            "timestamp": last_accessed_url.last_accessed_at,
        }

    by_url = Counter(click.url_id for click in clicks)
    top_links = [
        {
            "id": url_id,
            "short_code": urls_by_id[url_id].short_code,
            "short_url": build_short_url(urls_by_id[url_id].short_code),
            "clicks": count,
        }
        for url_id, count in by_url.most_common(5)
        if url_id in urls_by_id
    ]

    payload = {
        "range": range_value,
        "total_clicks": total_clicks,
        "unique_visitors": unique_visitors,
        "average_clicks_per_day": average_clicks_per_day,
        "active_links": active_links,
        "last_accessed": last_accessed,
        "clicks_over_time": _build_click_series(clicks, days),
        "top_links": top_links,
        "device_breakdown": _breakdown_from_clicks(clicks, _parse_device),
        "browser_breakdown": _breakdown_from_clicks(clicks, _parse_browser),
        "recent_activity": _recent_activity(clicks, urls_by_id),
    }

    if include_comparison:
        payload["comparison"] = _comparison_block(clicks, previous_clicks, days)

    return payload


def get_url_analytics(
    db: Session,
    user_id: int,
    url_id: int,
    range_value: Literal["7d", "30d", "90d"],
    include_comparison: bool = False,
) -> dict:
    url_entry = get_url_by_id_for_user(db=db, url_id=url_id, user_id=user_id)
    days = _range_days(range_value)
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=days - 1)
    start_at = datetime.combine(start_date, datetime.min.time())
    previous_start_at = start_at - timedelta(days=days)

    clicks = (
        db.query(Click)
        .filter(Click.url_id == url_entry.id, Click.timestamp >= start_at)
        .order_by(Click.timestamp.desc())
        .all()
    )

    previous_clicks: list[Click] = []
    if include_comparison:
        previous_clicks = (
            db.query(Click)
            .filter(
                Click.url_id == url_entry.id,
                Click.timestamp >= previous_start_at,
                Click.timestamp < start_at,
            )
            .order_by(Click.timestamp.desc())
            .all()
        )

    payload = {
        "range": range_value,
        "url_id": url_entry.id,
        "short_code": url_entry.short_code,
        "short_url": build_short_url(url_entry.short_code),
        "original_url": url_entry.original_url,
        "total_clicks": len(clicks),
        "unique_visitors": len({click.ip_hash for click in clicks}),
        "average_clicks_per_day": round(len(clicks) / days, 2),
        "last_accessed": url_entry.last_accessed_at,
        "clicks_over_time": _build_click_series(clicks, days),
        "device_breakdown": _breakdown_from_clicks(clicks, _parse_device),
        "browser_breakdown": _breakdown_from_clicks(clicks, _parse_browser),
        "recent_activity": _recent_activity(clicks, {url_entry.id: url_entry}),
    }

    if include_comparison:
        payload["comparison"] = _comparison_block(clicks, previous_clicks, days)

    return payload


def export_user_analytics_csv(
    db: Session,
    user_id: int,
    range_value: Literal["7d", "30d", "90d"],
    include_comparison: bool = False,
) -> str:
    analytics = get_user_analytics(
        db=db,
        user_id=user_id,
        range_value=range_value,
        include_comparison=include_comparison,
    )

    rows: list[list] = [
        ["scope", "all_links"],
        ["range", analytics["range"]],
        ["total_clicks", analytics["total_clicks"]],
        ["unique_visitors", analytics["unique_visitors"]],
        ["average_clicks_per_day", analytics["average_clicks_per_day"]],
        ["active_links", analytics["active_links"]],
        [],
        ["date", "label", "clicks"],
    ]

    rows.extend([[point["date"], point["label"], point["clicks"]] for point in analytics["clicks_over_time"]])

    rows.extend([[], ["top_links"], ["url_id", "short_url", "clicks"]])
    rows.extend([[item["id"], item["short_url"], item["clicks"]] for item in analytics["top_links"]])

    rows.extend([[], ["device_breakdown"], ["label", "value"]])
    rows.extend([[item["label"], item["value"]] for item in analytics["device_breakdown"]])

    rows.extend([[], ["browser_breakdown"], ["label", "value"]])
    rows.extend([[item["label"], item["value"]] for item in analytics["browser_breakdown"]])

    rows.extend([[], ["recent_activity"], ["url_id", "short_url", "timestamp", "device", "browser"]])
    rows.extend(
        [
            item["url_id"],
            item["short_url"],
            item["timestamp"].isoformat(),
            item["device"],
            item["browser"],
        ]
        for item in analytics["recent_activity"]
    )

    if include_comparison and analytics.get("comparison"):
        rows.extend([[], ["comparison"], ["metric", "current", "previous", "delta", "delta_pct", "trend"]])
        for metric, values in analytics["comparison"].items():
            rows.append(
                [
                    metric,
                    values["current"],
                    values["previous"],
                    values["delta"],
                    values["delta_pct"] if values["delta_pct"] is not None else "",
                    values["trend"],
                ]
            )

    return _to_csv_text(rows)


def export_url_analytics_csv(
    db: Session,
    user_id: int,
    url_id: int,
    range_value: Literal["7d", "30d", "90d"],
    include_comparison: bool = False,
) -> str:
    analytics = get_url_analytics(
        db=db,
        user_id=user_id,
        url_id=url_id,
        range_value=range_value,
        include_comparison=include_comparison,
    )

    rows: list[list] = [
        ["scope", "single_link"],
        ["range", analytics["range"]],
        ["url_id", analytics["url_id"]],
        ["short_url", analytics["short_url"]],
        ["original_url", analytics["original_url"]],
        ["total_clicks", analytics["total_clicks"]],
        ["unique_visitors", analytics["unique_visitors"]],
        ["average_clicks_per_day", analytics["average_clicks_per_day"]],
        ["last_accessed", analytics["last_accessed"].isoformat() if analytics.get("last_accessed") else ""],
        [],
        ["date", "label", "clicks"],
    ]

    rows.extend([[point["date"], point["label"], point["clicks"]] for point in analytics["clicks_over_time"]])

    rows.extend([[], ["device_breakdown"], ["label", "value"]])
    rows.extend([[item["label"], item["value"]] for item in analytics["device_breakdown"]])

    rows.extend([[], ["browser_breakdown"], ["label", "value"]])
    rows.extend([[item["label"], item["value"]] for item in analytics["browser_breakdown"]])

    rows.extend([[], ["recent_activity"], ["url_id", "short_url", "timestamp", "device", "browser"]])
    rows.extend(
        [
            item["url_id"],
            item["short_url"],
            item["timestamp"].isoformat(),
            item["device"],
            item["browser"],
        ]
        for item in analytics["recent_activity"]
    )

    if include_comparison and analytics.get("comparison"):
        rows.extend([[], ["comparison"], ["metric", "current", "previous", "delta", "delta_pct", "trend"]])
        for metric, values in analytics["comparison"].items():
            rows.append(
                [
                    metric,
                    values["current"],
                    values["previous"],
                    values["delta"],
                    values["delta_pct"] if values["delta_pct"] is not None else "",
                    values["trend"],
                ]
            )

    return _to_csv_text(rows)
