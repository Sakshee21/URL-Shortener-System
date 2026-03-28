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


class URLListItemResponse(BaseModel):
    id: int
    short_code: str
    short_url: str
    original_url: str
    created_at: datetime


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
