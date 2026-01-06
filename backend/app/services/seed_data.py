"""テストデータ投入用スクリプト"""

from datetime import datetime, timedelta, timezone
from supabase import create_client
import os
from loguru import logger

# 環境変数から設定を取得
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def seed_races():
    """サンプルレースデータを作成"""
    today = datetime.now(timezone.utc)

    races = [
        {
            "date": today.date().isoformat(),
            "venue": "中山",
            "race_number": 11,
            "race_name": "中山金杯",
            "grade": "G3",
            "distance": 2000,
            "surface": "turf",
            "condition": "良",
            "weather": "晴",
            "status": "betting",
            "start_time": (today + timedelta(hours=2)).isoformat(),
            "betting_start_time": (today + timedelta(hours=1, minutes=30)).isoformat(),
            "betting_end_time": (today + timedelta(hours=1, minutes=55)).isoformat(),
        },
        {
            "date": today.date().isoformat(),
            "venue": "京都",
            "race_number": 11,
            "race_name": "京都金杯",
            "grade": "G3",
            "distance": 1600,
            "surface": "turf",
            "condition": "良",
            "weather": "晴",
            "status": "betting",
            "start_time": (today + timedelta(hours=2, minutes=-10)).isoformat(),
            "betting_start_time": (today + timedelta(hours=1, minutes=20)).isoformat(),
            "betting_end_time": (today + timedelta(hours=1, minutes=50)).isoformat(),
        },
    ]

    for race_data in races:
        try:
            # レースを作成
            result = supabase.table("races").insert(race_data).execute()
            race_id = result.data[0]["id"]

            logger.info(f"Created race: {race_data['race_name']} (ID: {race_id})")

            # 出走馬データを作成
            horses = [
                {"race_id": race_id, "number": 1, "name": "ボッケリーニ", "jockey": "Ｃルメール", "trainer": "音無秀孝", "weight": 57.0, "odds": 3.2, "popularity": 1, "age": 7, "sex": "male", "previous_results": [1, 2, 3, 1, 2]},
                {"race_id": race_id, "number": 2, "name": "エヒト", "jockey": "横山武史", "trainer": "藤田伸二", "weight": 57.0, "odds": 5.8, "popularity": 2, "age": 6, "sex": "male", "previous_results": [2, 1, 4, 3, 1]},
                {"race_id": race_id, "number": 3, "name": "リカンカブール", "jockey": "戸崎圭太", "trainer": "音無秀孝", "weight": 57.0, "odds": 7.5, "popularity": 3, "age": 5, "sex": "male", "previous_results": [3, 2, 1, 5, 3]},
                {"race_id": race_id, "number": 4, "name": "マイネルウィルトス", "jockey": "菅原明良", "trainer": "音無秀孝", "weight": 57.0, "odds": 12.3, "popularity": 5, "age": 8, "sex": "male", "previous_results": [5, 4, 6, 2, 4]},
                {"race_id": race_id, "number": 5, "name": "レッドランメルト", "jockey": "池添謙一", "trainer": "音無秀孝", "weight": 57.0, "odds": 9.8, "popularity": 4, "age": 5, "sex": "male", "previous_results": [4, 3, 2, 6, 5]},
            ]

            supabase.table("horses").insert(horses).execute()
            logger.info(f"Created {len(horses)} horses for race {race_id}")

        except Exception as e:
            logger.error(f"Failed to create race {race_data['race_name']}: {e}")


def seed_badges():
    """バッジマスターデータを作成"""
    badges = [
        {
            "name": "初勝利",
            "description": "初めて予想が的中",
            "icon": "🎯",
            "category": "achievement",
            "condition": {"type": "first_win"}
        },
        {
            "name": "10連勝",
            "description": "10回連続で的中",
            "icon": "🔥",
            "category": "achievement",
            "condition": {"type": "consecutive_wins", "count": 10}
        },
        {
            "name": "大逆転",
            "description": "100倍以上のオッズで的中",
            "icon": "💎",
            "category": "achievement",
            "condition": {"type": "big_win", "odds": 100}
        },
        {
            "name": "コレクター",
            "description": "全競馬場で予想",
            "icon": "🗺️",
            "category": "achievement",
            "condition": {"type": "all_venues"}
        },
        {
            "name": "常連",
            "description": "30日連続ログイン",
            "icon": "📅",
            "category": "achievement",
            "condition": {"type": "consecutive_login", "days": 30}
        },
    ]

    for badge in badges:
        try:
            supabase.table("badges").upsert(badge, on_conflict="name").execute()
            logger.info(f"Created/Updated badge: {badge['name']}")
        except Exception as e:
            logger.error(f"Failed to create badge {badge['name']}: {e}")


if __name__ == "__main__":
    logger.info("Starting seed data creation...")
    seed_races()
    seed_badges()
    logger.info("Seed data creation completed!")

