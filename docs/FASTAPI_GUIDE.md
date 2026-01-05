# FastAPI開発ガイド

## 概要

競馬チャンプのバックエンドはFastAPI（Python）で開発されます。このドキュメントでは、FastAPIでの開発に関する重要な情報をまとめています。

## プロジェクト構成

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPIアプリケーション
│   ├── config.py            # 設定管理
│   ├── dependencies.py      # 依存性注入
│   ├── api/
│   │   ├── __init__.py
│   │   ├── races.py         # レース関連API
│   │   ├── bets.py          # 予想関連API
│   │   ├── coins.py          # コイン関連API
│   │   ├── ranking.py       # ランキング関連API
│   │   └── scrape.py        # スクレイピングAPI
│   ├── models/              # Pydanticモデル
│   │   ├── race.py
│   │   ├── bet.py
│   │   └── user.py
│   ├── services/            # ビジネスロジック
│   │   ├── race_service.py
│   │   ├── bet_service.py
│   │   └── coin_service.py
│   ├── scrapers/            # スクレイピング
│   │   ├── jra_scraper.py
│   │   └── odds_scraper.py
│   └── tasks/               # Celeryタスク
│       ├── race_tasks.py
│       └── odds_tasks.py
├── tests/                   # テスト
├── requirements.txt         # 依存関係
└── .env                     # 環境変数
```

## データベースアクセス

### Supabase Python SDKの使用

FastAPIからはSupabase Python SDKを使用してデータベースにアクセスします。

#### セットアップ

```python
from supabase import create_client, Client
import os

# 環境変数から取得
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Supabaseクライアント作成
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
```

#### 基本的なクエリ

```python
# レース一覧取得
races = supabase.table("races").select("*").eq("date", "2024-01-01").execute()

# レース詳細取得
race = supabase.table("races").select("*").eq("id", race_id).single().execute()

# 予想作成
bet = supabase.table("bets").insert({
    "user_id": user_id,
    "race_id": race_id,
    "bet_type": "win",
    "selections": [1],
    "amount": 100,
    "odds": 3.5
}).execute()

# コイン更新
supabase.table("users").update({
    "coins": new_coin_amount
}).eq("id", user_id).execute()
```

#### 非同期処理

```python
import asyncio
from supabase import create_client

async def get_races_async():
    # Supabase SDKは同期的ですが、asyncioでラップ可能
    loop = asyncio.get_event_loop()
    races = await loop.run_in_executor(
        None,
        lambda: supabase.table("races").select("*").execute()
    )
    return races
```

## 認証

### Supabase JWT検証

FastAPIエンドポイントでSupabase JWTを検証します。

#### 認証ミドルウェア

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client
import jwt
import os

security = HTTPBearer()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Supabase JWTトークンを検証"""
    token = credentials.credentials

    try:
        # JWT検証
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# エンドポイントでの使用
@app.get("/api/user/profile")
async def get_profile(user: dict = Depends(verify_token)):
    user_id = user["sub"]
    # ユーザー情報取得
    ...
```

## APIエンドポイント

### エンドポイント構造

```python
from fastapi import APIRouter, Depends
from app.models.race import RaceResponse
from app.dependencies import verify_token

router = APIRouter(prefix="/api/races", tags=["races"])

@router.get("/", response_model=list[RaceResponse])
async def get_races(
    date: str = None,
    status: str = None,
    user: dict = Depends(verify_token)
):
    """レース一覧取得"""
    # 実装
    pass

@router.get("/{race_id}", response_model=RaceResponse)
async def get_race(
    race_id: str,
    user: dict = Depends(verify_token)
):
    """レース詳細取得"""
    # 実装
    pass
```

### エラーハンドリング

```python
from fastapi import HTTPException, status

# エラー例
if not race:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Race not found"
    )

if user_coins < bet_amount:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Insufficient coins"
    )
```

## スクレイピング

### Playwrightの使用

```python
from playwright.async_api import async_playwright

async def scrape_races():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # JRAサイトにアクセス
        await page.goto("https://www.jra.go.jp/")

        # データ取得
        races = await page.evaluate("""
            // JavaScriptでデータ取得
        """)

        await browser.close()
        return races
```

## Celeryタスク

### タスク定義

```python
from celery import Celery
from app.config import settings

celery_app = Celery(
    "keiba_champ",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

@celery_app.task
def update_odds(race_id: str):
    """オッズ更新タスク"""
    # 実装
    pass

@celery_app.task
def fetch_race_results(race_id: str):
    """レース結果取得タスク"""
    # 実装
    pass
```

### スケジューリング

```python
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    "fetch-daily-races": {
        "task": "app.tasks.race_tasks.fetch_daily_races",
        "schedule": crontab(hour=5, minute=0),  # 毎日5:00
    },
    "update-odds": {
        "task": "app.tasks.odds_tasks.update_odds",
        "schedule": 300.0,  # 5分ごと
    },
}
```

## 環境変数

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
SUPABASE_JWT_SECRET=xxx

# データベース
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Celery
CELERY_BROKER_URL=redis://...
CELERY_RESULT_BACKEND=redis://...

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

## テスト

### テスト例

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_races():
    response = client.get("/api/races/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

## デプロイ

### Railway/Renderでのデプロイ

1. **環境変数設定**: Railway/Renderのダッシュボードで環境変数を設定
2. **ビルドコマンド**: `pip install -r requirements.txt`
3. **起動コマンド**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Celeryワーカー**: 別のサービスとして起動

## パフォーマンス最適化

### キャッシング

```python
from functools import lru_cache
import redis

redis_client = redis.from_url(REDIS_URL)

@lru_cache(maxsize=100)
def get_cached_races(date: str):
    cache_key = f"races:{date}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # データベースから取得
    races = fetch_races_from_db(date)

    # キャッシュに保存（5分間）
    redis_client.setex(cache_key, 300, json.dumps(races))
    return races
```

### 非同期処理

```python
from fastapi import BackgroundTasks

@app.post("/api/bets")
async def create_bet(
    bet_data: BetCreate,
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_token)
):
    # 予想作成
    bet = create_bet_in_db(bet_data)

    # バックグラウンドでランキング更新
    background_tasks.add_task(update_ranking, user["sub"])

    return bet
```

## ロギング

```python
import logging

logger = logging.getLogger(__name__)

@app.get("/api/races")
async def get_races():
    logger.info("Fetching races")
    try:
        races = fetch_races()
        logger.info(f"Fetched {len(races)} races")
        return races
    except Exception as e:
        logger.error(f"Error fetching races: {e}")
        raise
```

## 参考リンク

- [FastAPI公式ドキュメント](https://fastapi.tiangolo.com/)
- [Supabase Python SDK](https://github.com/supabase/supabase-py)
- [Celery公式ドキュメント](https://docs.celeryq.dev/)
- [Playwright Python](https://playwright.dev/python/)

