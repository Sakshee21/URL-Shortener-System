from fastapi import FastAPI
from sqlalchemy import inspect, text

from app.db.database import Base, engine
from app.routes import auth, url
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

        if "last_accessed_at" not in column_names:
            connection.execute(text("ALTER TABLE urls ADD COLUMN last_accessed_at DATETIME"))

        connection.commit()


Base.metadata.create_all(bind=engine)
ensure_url_analytics_columns()

app.include_router(auth.router)
app.include_router(url.router)

@app.get("/")
def root():
    return {"message": "Backend running successfully"}