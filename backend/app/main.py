from fastapi import FastAPI
from sqlalchemy import inspect, text

from app.db.database import Base, engine
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


Base.metadata.create_all(bind=engine)
ensure_url_analytics_columns()

app.include_router(auth.router)
app.include_router(url.router)

@app.get("/")
def root():
    return {"message": "Backend running successfully"}