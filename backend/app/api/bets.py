"""予想関連API"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client
from loguru import logger
from typing import Optional
from datetime import datetime, timezone

from app.dependencies import get_supabase, get_current_user
from app.models.bet import BetCreate, BetResponse, BetListResponse
from app.config import get_settings

router = APIRouter()
settings = get_settings()

# 予想タイプの定義
BET_TYPES = {
    "win": {"name": "単勝", "selections": 1},
    "place": {"name": "複勝", "selections": 1},
    "exacta": {"name": "馬連", "selections": 2},
    "wide": {"name": "ワイド", "selections": 2},
    "trio": {"name": "3連複", "selections": 3},
    "trifecta": {"name": "3連単", "selections": 3}
}


@router.post("/bets", response_model=BetResponse)
async def create_bet(
    bet_data: BetCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """予想作成"""
    user_id = current_user["id"]
    user_coins = current_user.get("coins", 0)
    is_premium = current_user.get("is_premium", False)
    
    # バリデーション
    if bet_data.bet_type not in BET_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid bet type. Must be one of: {list(BET_TYPES.keys())}"
        )
    
    expected_selections = BET_TYPES[bet_data.bet_type]["selections"]
    if len(bet_data.selections) != expected_selections:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{BET_TYPES[bet_data.bet_type]['name']} requires {expected_selections} horse(s)"
        )
    
    # 賭け金チェック
    max_bet = settings.MAX_BET_AMOUNT_PREMIUM if is_premium else settings.MAX_BET_AMOUNT
    if bet_data.amount < settings.MIN_BET_AMOUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum bet amount is {settings.MIN_BET_AMOUNT} coins"
        )
    if bet_data.amount > max_bet:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum bet amount is {max_bet} coins"
        )
    
    # コイン残高チェック
    if user_coins < bet_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient coins"
        )
    
    try:
        # レース情報を取得
        race = supabase.table("races").select("*").eq("id", bet_data.race_id).single().execute()
        
        if not race.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Race not found"
            )
        
        race_data = race.data
        
        # レースのステータスチェック
        if race_data["status"] != "betting":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Betting is not open for this race"
            )
        
        # オッズを取得（単勝の場合は馬のオッズ、その他は仮のオッズ）
        # MVPでは単勝・複勝のみ実装
        odds = 1.0
        if bet_data.bet_type == "win":
            horse = supabase.table("horses").select("odds").eq(
                "race_id", bet_data.race_id
            ).eq("number", bet_data.selections[0]).single().execute()
            if horse.data:
                odds = horse.data.get("odds", 1.0)
        elif bet_data.bet_type == "place":
            horse = supabase.table("horses").select("odds").eq(
                "race_id", bet_data.race_id
            ).eq("number", bet_data.selections[0]).single().execute()
            if horse.data:
                # 複勝オッズは単勝の約1/3として計算（簡易版）
                odds = max(1.1, horse.data.get("odds", 1.0) / 3)
        
        now = datetime.now(timezone.utc)
        
        # 予想を作成
        bet = {
            "user_id": user_id,
            "race_id": bet_data.race_id,
            "bet_type": bet_data.bet_type,
            "selections": bet_data.selections,
            "amount": bet_data.amount,
            "odds": odds,
            "status": "pending",
            "created_at": now.isoformat()
        }
        
        bet_result = supabase.table("bets").insert(bet).execute()
        
        # コインを減算
        new_coins = user_coins - bet_data.amount
        supabase.table("users").update({
            "coins": new_coins,
            "total_bets": current_user.get("total_bets", 0) + 1,
            "total_spent": current_user.get("total_spent", 0) + bet_data.amount
        }).eq("id", user_id).execute()
        
        # コイン取引履歴を記録
        transaction = {
            "user_id": user_id,
            "type": "spend",
            "amount": -bet_data.amount,
            "balance": new_coins,
            "reason": f"予想購入（{BET_TYPES[bet_data.bet_type]['name']}）",
            "metadata": {
                "race_id": bet_data.race_id,
                "bet_id": bet_result.data[0]["id"]
            },
            "created_at": now.isoformat()
        }
        supabase.table("coin_transactions").insert(transaction).execute()
        
        logger.info(f"Bet created: user={user_id}, race={bet_data.race_id}, type={bet_data.bet_type}")
        
        return BetResponse(
            bet=bet_result.data[0],
            user={"coins": new_coins}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create bet: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create bet"
        )


@router.get("/bets", response_model=BetListResponse)
async def get_bets(
    status: Optional[str] = Query(None, description="状態 (pending, won, lost)"),
    race_id: Optional[str] = Query(None, description="レースID"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """予想履歴取得"""
    user_id = current_user["id"]
    
    try:
        query = supabase.table("bets").select(
            "*, races(race_name, venue, date)",
            count="exact"
        ).eq("user_id", user_id)
        
        if status:
            query = query.eq("status", status)
        if race_id:
            query = query.eq("race_id", race_id)
        
        offset = (page - 1) * limit
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        
        result = query.execute()
        
        total = result.count or 0
        total_pages = (total + limit - 1) // limit
        
        return BetListResponse(
            bets=result.data or [],
            pagination={
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": total_pages
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to get bets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch bets"
        )


@router.get("/bets/{bet_id}")
async def get_bet(
    bet_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """予想詳細取得"""
    user_id = current_user["id"]
    
    try:
        result = supabase.table("bets").select(
            "*, races(*)"
        ).eq("id", bet_id).eq("user_id", user_id).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bet not found"
            )
        
        return {"bet": result.data}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get bet: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch bet"
        )

