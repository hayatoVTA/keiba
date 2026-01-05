"""レース関連タスク"""

from app.tasks import celery_app
from loguru import logger


@celery_app.task
def fetch_daily_races():
    """毎日のレースデータを取得"""
    logger.info("Fetching daily races...")
    # TODO: スクレイピング実装
    pass


@celery_app.task
def fetch_race_results(race_id: str):
    """レース結果を取得"""
    logger.info(f"Fetching results for race: {race_id}")
    # TODO: 結果取得・配当計算実装
    pass


@celery_app.task
def settle_bets(race_id: str):
    """予想を精算"""
    logger.info(f"Settling bets for race: {race_id}")
    # TODO: 予想精算実装
    pass

