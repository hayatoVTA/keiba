"""予想関連モデル"""

from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class BetCreate(BaseModel):
    """予想作成リクエスト"""
    race_id: str
    bet_type: str = Field(..., description="win, place, exacta, wide, trio, trifecta")
    selections: List[int] = Field(..., description="選択した馬番")
    amount: int = Field(..., ge=10, description="賭け金")


class Bet(BaseModel):
    """予想情報"""
    id: str
    user_id: str
    race_id: str
    bet_type: str
    selections: List[int]
    amount: int
    odds: float
    status: str  # 'pending' | 'won' | 'lost' | 'refunded'
    payout: Optional[int] = None
    created_at: datetime
    settled_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BetResponse(BaseModel):
    """予想作成レスポンス"""
    bet: Any
    user: dict


class BetListResponse(BaseModel):
    """予想一覧レスポンス"""
    bets: List[Any]
    pagination: dict

