"""FastAPI メインアプリケーション"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.config import get_settings
from app.api import races, bets, coins, ranking, users

settings = get_settings()

# FastAPIアプリケーション作成
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="競馬チャンプ - 競馬予想ゲームAPI",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ルーターの登録
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(races.router, prefix="/api", tags=["races"])
app.include_router(bets.router, prefix="/api", tags=["bets"])
app.include_router(coins.router, prefix="/api", tags=["coins"])
app.include_router(ranking.router, prefix="/api", tags=["ranking"])


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "Welcome to 競馬チャンプ API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """ヘルスチェック"""
    return {"status": "healthy"}


@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時の処理"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")


@app.on_event("shutdown")
async def shutdown_event():
    """アプリケーション終了時の処理"""
    logger.info("Shutting down application")

