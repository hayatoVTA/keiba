"""Celery タスク設定"""

from celery import Celery
from app.config import get_settings

settings = get_settings()

# Celery アプリケーション
celery_app = Celery(
    "keiba_champ",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.race_tasks",
        "app.tasks.odds_tasks",
    ]
)

# Celery 設定
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Tokyo",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30分
    worker_prefetch_multiplier=1,
)

# 定期タスクスケジュール
celery_app.conf.beat_schedule = {
    # 毎日5:00にレースデータを取得
    "fetch-daily-races": {
        "task": "app.tasks.race_tasks.fetch_daily_races",
        "schedule": {"hour": 5, "minute": 0},
    },
    # 5分ごとにオッズを更新
    "update-odds": {
        "task": "app.tasks.odds_tasks.update_odds",
        "schedule": 300.0,  # 5分
    },
}

