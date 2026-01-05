"""ユーザー関連モデル"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """ユーザー基本情報"""
    id: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar: Optional[str] = None
    coins: int = 10000
    total_bets: int = 0
    total_wins: int = 0
    total_earnings: int = 0
    total_spent: int = 0
    win_rate: float = 0.0
    rank: Optional[int] = None
    is_premium: bool = False
    premium_expires_at: Optional[datetime] = None
    consecutive_login_days: int = 0
    last_login_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    """ユーザー情報レスポンス"""
    id: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar: Optional[str] = None
    coins: int
    total_bets: int
    total_wins: int
    win_rate: float
    rank: Optional[int] = None
    is_premium: bool = False

    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    """プロフィールレスポンス"""
    user: dict

    class Config:
        from_attributes = True

