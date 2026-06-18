from pathlib import Path
import tempfile
import sys

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db.database import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.dependencies.rate_limit_dependency import RATE_LIMIT_STORAGE  # noqa: E402
from app.main import app  # noqa: E402
from app.models.user import User  # noqa: E402
import app.services.auth_service as auth_service  # noqa: E402
import app.services.url_service as url_service  # noqa: E402


TEST_DB_DIR = Path(tempfile.mkdtemp(prefix="url_shortener_tests_"))
TEST_DB_URL = f"sqlite:///{(TEST_DB_DIR / 'test_url_shortener.db').as_posix()}"

test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def isolate_db_and_overrides(monkeypatch):
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    RATE_LIMIT_STORAGE.clear()
    app.dependency_overrides[get_db] = override_get_db
    monkeypatch.setattr(auth_service, "hash_password", lambda password: password)
    monkeypatch.setattr(auth_service, "verify_password", lambda plain_password, hashed_password: plain_password == hashed_password)

    monkeypatch.setattr(
        url_service,
        "fetch_preview_metadata",
        lambda _url: {
            "page_title": "Test Page",
            "page_description": "Test description",
            "favicon_url": None,
            "preview_image_url": None,
        },
    )

    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def _register_and_login(client: TestClient, email: str, password: str) -> str:
    register_response = client.post(
        "/auth/register",
        json={"email": email, "password": password},
    )
    assert register_response.status_code == 200

    login_response = client.post(
        "/auth/login",
        data={"username": email, "password": password},
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


@pytest.fixture
def user_token(client):
    return _register_and_login(client, "user@test.com", "pass123")


@pytest.fixture
def admin_token(client, db_session):
    email = "admin@test.com"
    password = "adminpass123"
    token = _register_and_login(client, email, password)

    user = db_session.query(User).filter(User.email == email).first()
    user.is_admin = True
    db_session.commit()

    admin_login_response = client.post(
        "/auth/login",
        data={"username": email, "password": password},
    )
    assert admin_login_response.status_code == 200
    return admin_login_response.json()["access_token"]
