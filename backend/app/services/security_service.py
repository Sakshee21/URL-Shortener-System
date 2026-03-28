from pathlib import Path
from urllib.parse import urlparse

from fastapi import HTTPException

BLACKLIST_FILE_PATH = Path(__file__).resolve().parents[1] / "core" / "blacklist_domains.txt"


def _normalize_domain(value: str) -> str:
    candidate = value.strip().lower()
    if not candidate:
        return ""

    if "://" not in candidate:
        candidate = f"http://{candidate}"

    parsed = urlparse(candidate)
    host = (parsed.hostname or "").strip().lower()
    return host[4:] if host.startswith("www.") else host


def _load_local_blacklist() -> set[str]:
    if not BLACKLIST_FILE_PATH.exists():
        return set()

    domains: set[str] = set()
    for raw_line in BLACKLIST_FILE_PATH.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip().lower()
        if not line or line.startswith("#"):
            continue

        normalized = _normalize_domain(line)
        if normalized:
            domains.add(normalized)

    return domains

SUSPICIOUS_KEYWORDS = {"login", "verify", "bank", "free", "secure"}


def assert_url_not_blacklisted(url: str) -> None:
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    if host.startswith("www."):
        host = host[4:]

    blacklist = _load_local_blacklist()

    if host in blacklist or any(host.endswith(f".{domain}") for domain in blacklist):
        raise HTTPException(status_code=400, detail="URL blocked: domain is blacklisted")


def score_url_risk(url: str) -> tuple[int, str]:
    score = 0
    lowered = url.lower()

    if len(url) > 120:
        score += 25

    special_count = sum(1 for char in url if not char.isalnum())
    if special_count > 20:
        score += 20

    keyword_hits = sum(1 for keyword in SUSPICIOUS_KEYWORDS if keyword in lowered)
    score += keyword_hits * 15

    if score >= 60:
        return score, "high"

    if score >= 30:
        return score, "suspicious"

    return score, "safe"
