"""レース関連API"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client
from loguru import logger
from typing import Optional
from datetime import date

from app.dependencies import get_supabase, get_current_user
from app.models.race import RaceListResponse, RaceDetailResponse

router = APIRouter()


@router.get("/races", response_model=RaceListResponse)
async def get_races(
    race_date: Optional[str] = Query(None, description="日付 (YYYY-MM-DD)"),
    venue: Optional[str] = Query(None, description="競馬場名"),
    status: Optional[str] = Query(None, description="状態 (upcoming, betting, running, finished)"),
    page: int = Query(1, ge=1, description="ページ番号"),
    limit: int = Query(20, ge=1, le=100, description="1ページあたりの件数"),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """レース一覧取得"""
    try:
        # クエリを構築
        query = supabase.table("races").select(
            "*, horses(*)",
            count="exact"
        )

        # フィルター適用
        if race_date:
            query = query.eq("date", race_date)
        if venue:
            query = query.eq("venue", venue)
        if status:
            query = query.eq("status", status)

        # ページネーション
        offset = (page - 1) * limit
        query = query.order("start_time").range(offset, offset + limit - 1)

        result = query.execute()

        total = result.count or 0
        total_pages = (total + limit - 1) // limit

        return RaceListResponse(
            races=result.data or [],
            pagination={
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": total_pages
            }
        )

    except Exception as e:
        logger.error(f"Failed to get races: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch races"
        )


@router.get("/races/{race_id}", response_model=RaceDetailResponse)
async def get_race(
    race_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """レース詳細取得"""
    try:
        result = supabase.table("races").select(
            "*, horses(*), race_results(*)"
        ).eq("id", race_id).single().execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Race not found"
            )

        return RaceDetailResponse(race=result.data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get race: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch race"
        )

