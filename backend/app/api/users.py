"""ユーザー関連API"""

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from loguru import logger
from datetime import datetime, timezone

from app.dependencies import get_supabase, verify_token, get_current_user
from app.models.user import UserResponse, UserProfileResponse
from app.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/user/profile", response_model=UserProfileResponse)
async def get_profile(
    current_user: dict = Depends(get_current_user)
):
    """現在のユーザーのプロフィール情報取得"""
    return UserProfileResponse(user=current_user)


@router.post("/user/register-bonus")
async def claim_register_bonus(
    token_payload: dict = Depends(verify_token),
    supabase: Client = Depends(get_supabase)
):
    """新規登録ボーナスを付与（初回のみ）"""
    user_id = token_payload.get("sub")

    try:
        # ユーザーが既に存在するか確認
        existing = supabase.table("users").select("id, coins").eq("id", user_id).execute()

        if existing.data:
            # 既存ユーザー
            return {
                "message": "User already registered",
                "coins": existing.data[0]["coins"],
                "bonus_claimed": False
            }

        # 新規ユーザーを作成（初期コイン付与）
        user_data = {
            "id": user_id,
            "coins": settings.INITIAL_COINS,
            "total_bets": 0,
            "total_wins": 0,
            "total_earnings": 0,
            "total_spent": 0,
            "win_rate": 0.0,
            "consecutive_login_days": 1,
            "last_login_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        result = supabase.table("users").insert(user_data).execute()

        # コイン取引履歴を記録
        transaction = {
            "user_id": user_id,
            "type": "bonus",
            "amount": settings.INITIAL_COINS,
            "balance": settings.INITIAL_COINS,
            "reason": "新規登録ボーナス",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        supabase.table("coin_transactions").insert(transaction).execute()

        logger.info(f"New user registered with bonus: {user_id}")

        return {
            "message": "Registration bonus claimed!",
            "coins": settings.INITIAL_COINS,
            "bonus_claimed": True
        }

    except Exception as e:
        logger.error(f"Failed to claim register bonus: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process registration bonus"
        )


@router.post("/user/login-bonus")
async def claim_login_bonus(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """ログインボーナスを付与"""
    user_id = current_user["id"]

    try:
        now = datetime.now(timezone.utc)
        last_login = current_user.get("last_login_at")
        consecutive_days = current_user.get("consecutive_login_days", 0)
        current_coins = current_user.get("coins", 0)

        # 今日既にログインボーナスを受け取っているか確認
        if last_login:
            last_login_date = datetime.fromisoformat(last_login.replace("Z", "+00:00"))
            if last_login_date.date() == now.date():
                return {
                    "message": "Login bonus already claimed today",
                    "coins": current_coins,
                    "bonus_claimed": False,
                    "consecutive_days": consecutive_days
                }

            # 連続ログイン日数の計算
            days_diff = (now.date() - last_login_date.date()).days
            if days_diff == 1:
                consecutive_days += 1
            else:
                consecutive_days = 1
        else:
            consecutive_days = 1

        # ボーナス額の計算
        bonus = settings.DAILY_BONUS_COINS  # 基本100コイン

        # 連続ログインボーナス
        if consecutive_days >= 30:
            bonus += settings.LOGIN_BONUS_30_DAYS
        elif consecutive_days >= 14:
            bonus += settings.LOGIN_BONUS_14_DAYS
        elif consecutive_days >= 7:
            bonus += settings.LOGIN_BONUS_7_DAYS
        elif consecutive_days >= 3:
            bonus += settings.LOGIN_BONUS_3_DAYS

        new_coins = current_coins + bonus

        # ユーザー情報を更新
        supabase.table("users").update({
            "coins": new_coins,
            "consecutive_login_days": consecutive_days,
            "last_login_at": now.isoformat()
        }).eq("id", user_id).execute()

        # コイン取引履歴を記録
        reason = f"ログインボーナス（{consecutive_days}日連続）"
        transaction = {
            "user_id": user_id,
            "type": "bonus",
            "amount": bonus,
            "balance": new_coins,
            "reason": reason,
            "created_at": now.isoformat()
        }
        supabase.table("coin_transactions").insert(transaction).execute()

        logger.info(f"Login bonus claimed: user={user_id}, bonus={bonus}, consecutive_days={consecutive_days}")

        return {
            "message": reason,
            "coins": new_coins,
            "bonus": bonus,
            "bonus_claimed": True,
            "consecutive_days": consecutive_days
        }

    except Exception as e:
        logger.error(f"Failed to claim login bonus: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process login bonus"
        )

