"""レース関連モデル"""

from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class Horse(BaseModel):
    """出走馬情報"""
    number: int
    name: str
    jockey: str
    trainer: Optional[str] = None
    weight: Optional[float] = None
    odds: float
    popularity: int
    age: Optional[int] = None
    sex: Optional[str] = None
    previous_results: Optional[List[int]] = None

    class Config:
        from_attributes = True


class RaceResult(BaseModel):
    """レース結果"""
    first: int
    second: int
    third: int
    payout: dict
    finish_time: Optional[str] = None

    class Config:
        from_attributes = True


class Race(BaseModel):
    """レース情報"""
    id: str
    date: str
    venue: str
    race_number: int
    race_name: str
    grade: Optional[str] = None
    distance: int
    surface: str  # 'turf' | 'dirt'
    condition: str
    weather: Optional[str] = None
    status: str  # 'upcoming' | 'betting' | 'running' | 'finished' | 'cancelled'
    start_time: datetime
    betting_start_time: datetime
    betting_end_time: datetime
    horses: Optional[List[Horse]] = None
    result: Optional[RaceResult] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Pagination(BaseModel):
    """ページネーション情報"""
    page: int
    limit: int
    total: int
    totalPages: int


class RaceListResponse(BaseModel):
    """レース一覧レスポンス"""
    races: List[Any]
    pagination: Pagination


class RaceDetailResponse(BaseModel):
    """レース詳細レスポンス"""
    race: Any

