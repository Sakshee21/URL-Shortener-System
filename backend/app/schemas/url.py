from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class URLCreate(BaseModel):
    original_url: str


class URLCreateResponse(BaseModel):
    short_code: str
    short_url: str
    original_url: str
    created_at: datetime
    user_id: Optional[int] = None
    risk_level: str
    risk_score: int


class URLListItemResponse(BaseModel):
    id: int
    short_code: str
    short_url: str
    original_url: str
    created_at: datetime
    click_count: int
    unique_click_count: int
    last_accessed_at: Optional[datetime] = None
    risk_level: str
    risk_score: int
    is_active: bool


class URLStatusUpdateRequest(BaseModel):
    is_active: bool


class URLStatusUpdateResponse(BaseModel):
    id: int
    is_active: bool


class URLWarningResponse(BaseModel):
    short_code: str
    original_url: str
    domain: str
    risk_level: str
    risk_score: int
    page_title: Optional[str] = None
    page_description: Optional[str] = None
    favicon_url: Optional[str] = None
    preview_image_url: Optional[str] = None
    continue_url: str


class URLResolveResponse(BaseModel):
    original_url: str


class URLDetailResponse(BaseModel):
    id: int
    original_url: str
    short_code: str
    created_at: datetime
    user_id: Optional[int] = None

    class Config:
        from_attributes = True
