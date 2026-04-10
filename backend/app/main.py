from datetime import datetime

from fastapi import FastAPI
from sqlalchemy import func, inspect, text

from app.core.config import ADMIN_EMAIL, ADMIN_PASSWORD
from app.core.security import hash_password
from app.db.database import Base, engine
from app.db.session import SessionLocal
from app.models.user import User
from app.models.url import URL
from app.models.click import Click
from app.routes import admin
from app.routes import auth, url
from app.models import click as click_model
from app.models import user, url as url_model
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ensure_url_analytics_columns() -> None:
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    if "urls" not in table_names:
        return

    column_names = {column["name"] for column in inspector.get_columns("urls")}

    with engine.connect() as connection:
        if "click_count" not in column_names:
            connection.execute(text("ALTER TABLE urls ADD COLUMN click_count INTEGER NOT NULL DEFAULT 0"))

        if "unique_click_count" not in column_names:
            connection.execute(text("ALTER TABLE urls ADD COLUMN unique_click_count INTEGER NOT NULL DEFAULT 0"))

        if "last_accessed_at" not in column_names:
            connection.execute(text("ALTER TABLE urls ADD COLUMN last_accessed_at DATETIME"))

        if "risk_level" not in column_names:
            connection.execute(text("ALTER TABLE urls ADD COLUMN risk_level VARCHAR NOT NULL DEFAULT 'safe'"))

        if "risk_score" not in column_names:
            connection.execute(text("ALTER TABLE urls ADD COLUMN risk_score INTEGER NOT NULL DEFAULT 0"))

        if "page_title" not in column_names:
            connection.execute(text("ALTER TABLE urls ADD COLUMN page_title VARCHAR"))

        if "page_description" not in column_names:
            connection.execute(text("ALTER TABLE urls ADD COLUMN page_description VARCHAR"))

        if "favicon_url" not in column_names:
            connection.execute(text("ALTER TABLE urls ADD COLUMN favicon_url VARCHAR"))

        if "preview_image_url" not in column_names:
            connection.execute(text("ALTER TABLE urls ADD COLUMN preview_image_url VARCHAR"))

        if "is_active" not in column_names:
            connection.execute(text("ALTER TABLE urls ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT 1"))

        connection.commit()


def ensure_user_columns() -> None:
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    if "users" not in table_names:
        return

    column_names = {column["name"] for column in inspector.get_columns("users")}

    with engine.connect() as connection:
        if "created_at" not in column_names:
            connection.execute(text("ALTER TABLE users ADD COLUMN created_at DATETIME"))

        if "is_admin" not in column_names:
            connection.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0"))

        if "is_active" not in column_names:
            connection.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT 1"))

        connection.execute(text("UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"))
        connection.execute(text("UPDATE users SET is_active = 1 WHERE is_active IS NULL"))
        connection.commit()


def seed_admin_user() -> None:
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        return

    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == ADMIN_EMAIL).first()

        if admin_user is None:
            admin_user = User(
                email=ADMIN_EMAIL,
                hashed_password=hash_password(ADMIN_PASSWORD),
                created_at=datetime.utcnow(),
                is_admin=True,
            )
            db.add(admin_user)
        elif not admin_user.is_admin:
            admin_user.is_admin = True

        db.commit()
    finally:
        db.close()


def reconcile_user_created_at_from_activity() -> None:
    db = SessionLocal()
    try:
        users = db.query(User).all()
        if not users:
            return

        earliest_urls_by_user = dict(
            db.query(URL.user_id, func.min(URL.created_at))
            .filter(URL.user_id.isnot(None))
            .group_by(URL.user_id)
            .all()
        )

        earliest_clicks_by_user = dict(
            db.query(URL.user_id, func.min(Click.timestamp))
            .join(Click, Click.url_id == URL.id)
            .filter(URL.user_id.isnot(None))
            .group_by(URL.user_id)
            .all()
        )

        updated = False
        for user_entry in users:
            candidates = [
                earliest_urls_by_user.get(user_entry.id),
                earliest_clicks_by_user.get(user_entry.id),
            ]
            candidates = [timestamp for timestamp in candidates if timestamp is not None]

            if not candidates or user_entry.created_at is None:
                continue

            inferred_created_at = min(candidates)
            if inferred_created_at < user_entry.created_at:
                user_entry.created_at = inferred_created_at
                updated = True

        if updated:
            db.commit()
    finally:
        db.close()


Base.metadata.create_all(bind=engine)
ensure_user_columns()
ensure_url_analytics_columns()
seed_admin_user()
reconcile_user_created_at_from_activity()

app.include_router(auth.router)
app.include_router(url.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Backend running successfully"}