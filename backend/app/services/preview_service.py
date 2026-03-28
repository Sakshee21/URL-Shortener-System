import re
from html import unescape
from urllib.error import URLError
from urllib.request import Request, urlopen


def _extract_meta(pattern: str, html: str) -> str | None:
    match = re.search(pattern, html, re.IGNORECASE | re.DOTALL)
    if not match:
        return None
    return unescape(match.group(1)).strip()


def fetch_preview_metadata(url: str) -> dict[str, str | None]:
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    )

    try:
        with urlopen(request, timeout=4) as response:
            content = response.read(250000).decode("utf-8", errors="ignore")
    except (TimeoutError, URLError, ValueError):
        return {
            "page_title": None,
            "page_description": None,
            "favicon_url": None,
            "preview_image_url": None,
        }

    title = _extract_meta(r"<title[^>]*>(.*?)</title>", content)
    description = _extract_meta(
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']',
        content,
    )
    description_alt = _extract_meta(
        r'<meta[^>]+content=["\'](.*?)["\'][^>]+name=["\']description["\']',
        content,
    )
    og_description = _extract_meta(
        r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\'](.*?)["\']',
        content,
    )
    og_description_alt = _extract_meta(
        r'<meta[^>]+content=["\'](.*?)["\'][^>]+property=["\']og:description["\']',
        content,
    )
    favicon = _extract_meta(
        r'<link[^>]+rel=["\'][^"\']*icon[^"\']*["\'][^>]+href=["\'](.*?)["\']',
        content,
    )
    og_image = _extract_meta(
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\'](.*?)["\']',
        content,
    )
    og_image_alt = _extract_meta(
        r'<meta[^>]+content=["\'](.*?)["\'][^>]+property=["\']og:image["\']',
        content,
    )

    return {
        "page_title": title,
        "page_description": description or description_alt or og_description or og_description_alt,
        "favicon_url": favicon,
        "preview_image_url": og_image or og_image_alt,
    }
