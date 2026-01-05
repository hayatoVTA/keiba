"""コイン関連API"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client
from loguru import logger
from typing import Optional
from datetime import datetime, timezone

from app.dependencies import get_supabase, get_current_user
from app.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/coins/balance")
async def get_balance(
    current_user: dict = Depends(get_current_user)
):
    """コイン残高取得"""
    return {"coins": current_user.get("coins", 0)}


@router.get("/coins/transactions")
async def get_transactions(
    type: Optional[str] = Query(None, description="種類 (earn, spend, purchase, bonus)"),
    start_date: Optional[str] = Query(None, description="開始日 (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="終了日 (YYYY-MM-DD)"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """コイン取引履歴取得"""
    user_id = current_user["id"]

    try:
        query = supabase.table("coin_transactions").select(
            "*", count="exact"
        ).eq("user_id", user_id)

        if type:
            query = query.eq("type", type)
        if start_date:
            query = query.gte("created_at", f"{start_date}T00:00:00Z")
        if end_date:
            query = query.lte("created_at", f"{end_date}T23:59:59Z")

        offset = (page - 1) * limit
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)

        result = query.execute()

        total = result.count or 0
        total_pages = (total + limit - 1) // limit

        return {
            "transactions": result.data or [],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": total_pages
            }
        }

    except Exception as e:
        logger.error(f"Failed to get transactions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch transactions"
        )


@router.post("/coins/bonus/daily")
async def claim_daily_bonus(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """デイリーボーナス獲得（ログインボーナスと同じ処理）"""
    # ログインボーナスと統合されているため、users.pyのlogin_bonusを使用
    # このエンドポイントはレガシー互換性のために残す
    from app.api.users import claim_login_bonus
    return await claim_login_bonus(current_user, supabase)


@router.post("/coins/bonus/ad")
async def claim_ad_bonus(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """広告視聴ボーナス獲得"""
    user_id = current_user["id"]
    current_coins = current_user.get("coins", 0)

    try:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # 今日の広告視聴回数を確認
        ad_views = supabase.table("advertisement_views").select(
            "id", count="exact"
        ).eq("user_id", user_id).gte(
            "viewed_at", today_start.isoformat()
        ).execute()

        view_count = ad_views.count or 0

        if view_count >= settings.AD_VIEW_MAX_PER_DAY:
            return {
                "message": f"Daily ad view limit reached ({settings.AD_VIEW_MAX_PER_DAY})",
                "coins": current_coins,
                "bonus_claimed": False,
                "remaining_views": 0
            }

        bonus = settings.AD_VIEW_COINS
        new_coins = current_coins + bonus

        # 広告視聴履歴を記録
        supabase.table("advertisement_views").insert({
            "user_id": user_id,
            "ad_type": "video",
            "coins_earned": bonus,
            "viewed_at": now.isoformat()
        }).execute()

        # コインを更新
        supabase.table("users").update({
            "coins": new_coins
        }).eq("id", user_id).execute()

        # コイン取引履歴を記録
        transaction = {
            "user_id": user_id,
            "type": "bonus",
            "amount": bonus,
            "balance": new_coins,
            "reason": "広告視聴ボーナス",
            "created_at": now.isoformat()
        }
        supabase.table("coin_transactions").insert(transaction).execute()

        remaining_views = settings.AD_VIEW_MAX_PER_DAY - view_count - 1

        logger.info(f"Ad bonus claimed: user={user_id}, bonus={bonus}")

        return {
            "message": "広告視聴ボーナスを獲得しました",
            "coins": new_coins,
            "bonus": bonus,
            "bonus_claimed": True,
            "remaining_views": remaining_views
        }

    except Exception as e:
        logger.error(f"Failed to claim ad bonus: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process ad bonus"
        )

