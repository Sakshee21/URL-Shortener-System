import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./url_shortener.db")

# psycopg2 requires postgresql:// but Render (and some other hosts) may give postgres://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

Base = declarative_base()