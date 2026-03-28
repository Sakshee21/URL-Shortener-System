from collections import defaultdict, deque
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, Request
from jose import JWTError, jwt

from app.core.config import ALGORITHM, SECRET_KEY
from app.dependencies.auth_dependencies import optional_oauth2_scheme

RATE_LIMIT_STORAGE: dict[str, deque[datetime]] = defaultdict(deque)
MAX_REQUESTS = 10
WINDOW_SECONDS = 60


def _build_limiter_key(request: Request, token: str | None) -> str:
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            subject = payload.get("sub")
            if subject:
                return f"user:{subject}"
        except JWTError:
            pass

    ip = request.client.host if request.client else "unknown"
    return f"ip:{ip}"


def rate_limit_create_url(
    request: Request,
    token: str | None = Depends(optional_oauth2_scheme),
):
    key = _build_limiter_key(request, token)
    now = datetime.utcnow()
    window_start = now - timedelta(seconds=WINDOW_SECONDS)

    queue = RATE_LIMIT_STORAGE[key]
    while queue and queue[0] < window_start:
        queue.popleft()

    if len(queue) >= MAX_REQUESTS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please retry in a minute.")

    queue.append(now)
