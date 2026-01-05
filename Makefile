.PHONY: help dev prod down logs clean build

# デフォルトターゲット
help:
	@echo "競馬チャンプ - Docker管理コマンド"
	@echo ""
	@echo "使用方法:"
	@echo "  make dev        開発環境を起動（ホットリロード有効）"
	@echo "  make prod       本番環境を起動"
	@echo "  make down       コンテナを停止"
	@echo "  make logs       ログを表示"
	@echo "  make build      イメージをビルド"
	@echo "  make clean      コンテナとボリュームを削除"
	@echo ""
	@echo "個別サービス:"
	@echo "  make frontend   フロントエンドのみ起動"
	@echo "  make backend    バックエンドのみ起動"
	@echo "  make redis      Redisのみ起動"
	@echo ""
	@echo "ユーティリティ:"
	@echo "  make shell-frontend  フロントエンドコンテナにシェル接続"
	@echo "  make shell-backend   バックエンドコンテナにシェル接続"
	@echo "  make prisma-studio   Prisma Studioを起動"

# 開発環境
dev:
	docker-compose -f docker-compose.dev.yml up

dev-build:
	docker-compose -f docker-compose.dev.yml up --build

dev-d:
	docker-compose -f docker-compose.dev.yml up -d

# 本番環境
prod:
	docker-compose up

prod-build:
	docker-compose up --build

prod-d:
	docker-compose up -d

# 停止
down:
	docker-compose -f docker-compose.dev.yml down
	docker-compose down

# ログ
logs:
	docker-compose -f docker-compose.dev.yml logs -f

logs-frontend:
	docker-compose -f docker-compose.dev.yml logs -f frontend

logs-backend:
	docker-compose -f docker-compose.dev.yml logs -f backend

# ビルド
build:
	docker-compose build

build-frontend:
	docker-compose build frontend

build-backend:
	docker-compose build backend

# クリーンアップ
clean:
	docker-compose -f docker-compose.dev.yml down -v --rmi local
	docker-compose down -v --rmi local

# 個別サービス
frontend:
	docker-compose -f docker-compose.dev.yml up frontend

backend:
	docker-compose -f docker-compose.dev.yml up backend redis

redis:
	docker-compose -f docker-compose.dev.yml up redis

# シェル接続
shell-frontend:
	docker-compose -f docker-compose.dev.yml exec frontend sh

shell-backend:
	docker-compose -f docker-compose.dev.yml exec backend bash

# Prisma
prisma-studio:
	cd frontend && npx prisma studio

prisma-migrate:
	cd frontend && npx prisma migrate dev

prisma-generate:
	cd frontend && npx prisma generate

# テスト
test-backend:
	docker-compose -f docker-compose.dev.yml exec backend pytest

# Celery
celery-worker:
	docker-compose -f docker-compose.dev.yml up celery-worker

celery-beat:
	docker-compose -f docker-compose.dev.yml up celery-beat

