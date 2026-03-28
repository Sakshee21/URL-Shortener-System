from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class URL(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    original_url = Column(String, nullable=False)
    short_code = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    click_count = Column(Integer, default=0, nullable=False)
    unique_click_count = Column(Integer, default=0, nullable=False)
    last_accessed_at = Column(DateTime, nullable=True)
    risk_level = Column(String, default="safe", nullable=False)
    risk_score = Column(Integer, default=0, nullable=False)
    page_title = Column(String, nullable=True)
    page_description = Column(String, nullable=True)
    favicon_url = Column(String, nullable=True)
    preview_image_url = Column(String, nullable=True)

    owner = relationship("User", back_populates="urls")
    clicks = relationship("Click", back_populates="url")
