from datetime import timedelta

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

BASE_URL = "http://127.0.0.1:8000"
SHORT_CODE_LENGTH = 6
SHORT_CODE_MAX_RETRIES = 10