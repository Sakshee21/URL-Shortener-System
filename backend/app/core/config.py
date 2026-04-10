import os

from datetime import timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
MIN_SHORT_CODE_LENGTH = 6
SHORT_CODE_LENGTH = 6
SHORT_CODE_MAX_RETRIES = 10

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")