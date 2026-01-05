"""ランキング関連API"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client
from loguru import logger
from typing import Optional

from app.dependencies import get_supabase, get_current_user

router = APIRouter()


@router.get("/ranking/assets")
async def get_assets_ranking(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """総資産ランキング取得"""
    try:
        offset = (page - 1) * limit
        
        # ランキング取得
        result = supabase.table("users").select(
            "id, display_name, avatar, coins",
            count="exact"
        ).order("coins", desc=True).range(offset, offset + limit - 1).execute()
        
        total = result.count or 0
        total_pages = (total + limit - 1) // limit
        
        # ランキングにランク番号を付与
        ranking = []
        for i, user in enumerate(result.data or []):
            ranking.append({
                "rank": offset + i + 1,
                "user": user
            })
        
        # 自分のランクを取得
        my_rank = None
        my_rank_result = supabase.rpc(
            "get_user_rank_by_coins",
            {"target_user_id": current_user["id"]}
        ).execute()
        
        if my_rank_result.data:
            my_rank = {
                "rank": my_rank_result.data,
                "coins": current_user.get("coins", 0)
            }
        
        return {
            "ranking": ranking,
            "myRank": my_rank,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": total_pages
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get assets ranking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch ranking"
        )


@router.get("/ranking/profit")
async def get_profit_ranking(
    period: Optional[str] = Query("all", description="期間 (daily, weekly, monthly, all)"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """収支ランキング取得"""
    try:
        offset = (page - 1) * limit
        
        # 収支計算: total_earnings - total_spent
        # MVPでは簡易的にtotal_earningsとtotal_spentの差で計算
        result = supabase.table("users").select(
            "id, display_name, avatar, total_earnings, total_spent",
            count="exact"
        ).order("total_earnings", desc=True).range(offset, offset + limit - 1).execute()
        
        total = result.count or 0
        total_pages = (total + limit - 1) // limit
        
        ranking = []
        for i, user in enumerate(result.data or []):
            net_profit = (user.get("total_earnings", 0) or 0) - (user.get("total_spent", 0) or 0)
            ranking.append({
                "rank": offset + i + 1,
                "user": {
                    "id": user["id"],
                    "displayName": user.get("display_name"),
                    "avatar": user.get("avatar"),
                    "netProfit": net_profit
                }
            })
        
        # 自分の収支を計算
        my_net_profit = (current_user.get("total_earnings", 0) or 0) - (current_user.get("total_spent", 0) or 0)
        my_rank = {
            "rank": None,  # TODO: 実際のランクを計算
            "netProfit": my_net_profit
        }
        
        return {
            "ranking": ranking,
            "myRank": my_rank,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": total_pages
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get profit ranking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch ranking"
        )


@router.get("/ranking/win-rate")
async def get_win_rate_ranking(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """的中率ランキング取得"""
    try:
        offset = (page - 1) * limit
        
        # 10回以上予想しているユーザーのみ
        result = supabase.table("users").select(
            "id, display_name, avatar, win_rate, total_bets, total_wins",
            count="exact"
        ).gte("total_bets", 10).order("win_rate", desc=True).range(
            offset, offset + limit - 1
        ).execute()
        
        total = result.count or 0
        total_pages = (total + limit - 1) // limit
        
        ranking = []
        for i, user in enumerate(result.data or []):
            ranking.append({
                "rank": offset + i + 1,
                "user": {
                    "id": user["id"],
                    "displayName": user.get("display_name"),
                    "avatar": user.get("avatar"),
                    "winRate": user.get("win_rate", 0),
                    "totalBets": user.get("total_bets", 0),
                    "totalWins": user.get("total_wins", 0)
                }
            })
        
        my_rank = {
            "rank": None,
            "winRate": current_user.get("win_rate", 0),
            "totalBets": current_user.get("total_bets", 0),
            "totalWins": current_user.get("total_wins", 0)
        }
        
        return {
            "ranking": ranking,
            "myRank": my_rank,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": total_pages
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get win rate ranking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch ranking"
        )

