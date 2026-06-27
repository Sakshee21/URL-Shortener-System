from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from sqlalchemy import func

from app.core.config import ADMIN_EMAIL, ADMIN_PASSWORD, FRONTEND_BASE_URL
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

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

if FRONTEND_BASE_URL and FRONTEND_BASE_URL not in allowed_origins:
    allowed_origins.append(FRONTEND_BASE_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



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
seed_admin_user()
reconcile_user_created_at_from_activity()

app.include_router(auth.router)
app.include_router(url.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Backend running successfully"}