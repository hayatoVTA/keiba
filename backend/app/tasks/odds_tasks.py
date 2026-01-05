"""オッズ関連タスク"""

from app.tasks import celery_app
from loguru import logger


@celery_app.task
def update_odds():
    """オッズを更新"""
    logger.info("Updating odds...")
    # TODO: オッズ更新実装
    pass


@celery_app.task
def update_race_odds(race_id: str):
    """特定レースのオッズを更新"""
    logger.info(f"Updating odds for race: {race_id}")
    # TODO: 特定レースのオッズ更新実装
    pass

