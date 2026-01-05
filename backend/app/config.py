"""アプリケーション設定"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """環境変数から設定を読み込む"""
    
    # アプリケーション設定
    APP_NAME: str = "競馬チャンプ API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    
    # Supabase設定
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    
    # Redis設定
    REDIS_URL: str = "redis://localhost:6379"
    
    # Celery設定
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # CORS設定
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # コイン設定
    INITIAL_COINS: int = 10000  # 新規登録時の初期コイン
    DAILY_BONUS_COINS: int = 100  # デイリーボーナス
    LOGIN_BONUS_3_DAYS: int = 50  # 3日連続ログインボーナス
    LOGIN_BONUS_7_DAYS: int = 200  # 7日連続ログインボーナス
    LOGIN_BONUS_14_DAYS: int = 500  # 14日連続ログインボーナス
    LOGIN_BONUS_30_DAYS: int = 2000  # 30日連続ログインボーナス
    AD_VIEW_COINS: int = 50  # 広告視聴ボーナス
    AD_VIEW_MAX_PER_DAY: int = 5  # 1日最大広告視聴回数
    
    # 予想設定
    MIN_BET_AMOUNT: int = 10  # 最小賭け金
    MAX_BET_AMOUNT: int = 10000  # 最大賭け金（通常ユーザー）
    MAX_BET_AMOUNT_PREMIUM: int = 50000  # 最大賭け金（プレミアム）
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """設定のシングルトンインスタンスを取得"""
    return Settings()

