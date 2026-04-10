from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class AdminGrowthPoint(BaseModel):
    label: str
    value: int


class AdminUserSummary(BaseModel):
    id: int
    email: str
    created_at: datetime
    total_links: int
    total_clicks: int
    is_admin: bool


class AdminLinkSummary(BaseModel):
    id: int
    short_code: str
    short_url: str
    original_url: str
    owner_email: Optional[str] = None
    created_at: datetime
    click_count: int
    is_active: bool
    risk_level: str


class AdminActivityItem(BaseModel):
    type: Literal["signup", "link_created", "click"]
    message: str
    timestamp: datetime


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_links: int
    total_clicks: int
    active_links: int
    user_growth: list[AdminGrowthPoint]
    recent_users: list[AdminUserSummary]
    recent_links: list[AdminLinkSummary]
    recent_activity: list[AdminActivityItem]