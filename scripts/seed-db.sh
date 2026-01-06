#!/bin/bash

# データベースにシードデータを投入するスクリプト

echo "🌱 データベースにシードデータを投入します..."

# バックエンドディレクトリに移動
cd "$(dirname "$0")/../backend"

# 環境変数を読み込む
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Pythonスクリプトを実行
python -c "
from app.services.seed_data import seed_races, seed_badges
from loguru import logger

logger.info('Starting seed data creation...')
try:
    seed_races()
    seed_badges()
    logger.info('✅ Seed data creation completed!')
except Exception as e:
    logger.error(f'❌ Failed to seed data: {e}')
    exit(1)
"

echo "✅ シードデータの投入が完了しました！"

