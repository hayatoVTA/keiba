# 技術スタック詳細

## アーキテクチャ概要

本プロジェクトは、フロントエンド（Next.js）とバックエンド（FastAPI）を分離した構成を採用しています。

```
┌─────────────────┐
│   Next.js       │ フロントエンド
│   (Vercel)      │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
┌────────▼────────┐  ┌──▼──────────────┐
│  Supabase Auth  │  │  FastAPI         │ バックエンド
│                 │  │  (Railway/Render)│
└────────┬────────┘  └──┬───────────────┘
         │              │
         └──────┬───────┘
                │
         ┌──────▼───────┐
         │  Supabase   │ データベース
         │  PostgreSQL │
         └─────────────┘
```

## フロントエンド

### Next.js（最新版）

- **バージョン**: 最新の安定版を使用
- **理由**:
  - SSR/SSG対応
  - SEO最適化
  - 優れたパフォーマンス
  - App Routerによる最新機能
- **主要機能**:
  - App Router
  - Server Components
  - 自動コード分割
  - 画像最適化

### React 18

- **理由**: 最新のReact機能
- **主要機能**:
  - Server Components
  - Streaming SSR
  - Concurrent Features

### TypeScript

- **理由**: 型安全性、開発効率向上
- **設定**: 厳格モード有効

### Tailwind CSS

- **理由**: 高速なスタイリング
- **設定**: JITモード有効

### shadcn/ui

- **理由**: 高品質なUIコンポーネント
- **主要コンポーネント**: Button, Card, Dialog, Table, Badge

### Zustand

- **理由**: 軽量な状態管理
- **用途**: ユーザー情報、コイン残高

### React Query

- **理由**: サーバー状態管理
- **用途**: レースデータ、ランキング、予想履歴

### Supabase JavaScript SDK

- **理由**: Supabase Authとデータベースアクセス
- **用途**:
  - 認証（`@supabase/supabase-js`）
  - データベースクエリ（必要に応じて）

## バックエンド

### FastAPI (Python)

- **バージョン**: 最新版
- **理由**:
  - 高速なパフォーマンス
  - 非同期処理対応
  - 自動APIドキュメント生成
  - Pythonの豊富なライブラリ
- **主要機能**:
  - OpenAPI/Swagger自動生成
  - Pydanticによる型検証
  - 依存性注入
  - 非同期エンドポイント

### Python バージョン

- **推奨**: Python 3.11以上
- **理由**: パフォーマンスと型ヒントの改善

### 主要Pythonライブラリ

#### Web Framework
- `fastapi`: Webフレームワーク
- `uvicorn`: ASGIサーバー

#### データベース
- `supabase`: Supabase Python SDK
- `sqlalchemy`: ORM（必要に応じて）
- `asyncpg`: 非同期PostgreSQLドライバー（必要に応じて）

#### スクレイピング
- `playwright`: ヘッドレスブラウザ
- `beautifulsoup4`: HTMLパーシング
- `lxml`: XML/HTMLパーサー

#### スケジューリング
- `apscheduler`: 定期実行タスク

#### ジョブキュー
- `celery`: 非同期タスクキュー
- `redis`: Celeryブローカー

#### その他
- `pydantic`: データ検証
- `python-jose`: JWT検証
- `python-multipart`: ファイルアップロード
- `httpx`: 非同期HTTPクライアント
- `tenacity`: リトライ機能

## 認証

### Supabase Auth

- **理由**:
  - 完全マネージド認証サービス
  - セキュリティが高い
  - 実装が容易
  - 複数の認証方法をサポート
- **機能**:
  - メール認証
  - ソーシャルログイン（Google, Twitter等）
  - セッション管理
  - ユーザー管理
  - JWTトークン発行

### 認証フロー

1. **Next.jsクライアント**: Supabase JavaScript SDKで認証
2. **JWT取得**: Supabase AuthがJWTトークンを発行
3. **FastAPI認証**: JWTトークンを検証してAPIアクセス

## データベース

### Supabase PostgreSQL

- **理由**:
  - PostgreSQLの完全マネージドサービス
  - Supabase Authと統合
  - リアルタイム機能
  - Row Level Security (RLS)
- **機能**:
  - 自動バックアップ
  - 接続プーリング
  - リアルタイムサブスクリプション
  - RLSによるセキュリティ

### Prisma

- **理由**: 型安全なORM
- **用途**:
  - スキーマ定義
  - マイグレーション
  - TypeScriptクライアント生成
- **注意**: FastAPIからはSupabase SDKまたはSQLAlchemyを使用

## キャッシュ

### Redis

- **理由**: 高速キャッシュ
- **用途**:
  - レースデータキャッシュ
  - オッズデータキャッシュ
  - ランキングキャッシュ
  - Celeryブローカー
- **サービス**: Upstash（サーバーレスRedis）

## ジョブキュー

### Celery

- **理由**: Python用の信頼性の高いジョブキュー
- **構成**:
  - **ブローカー**: Redis
  - **バックエンド**: Redis
  - **ワーカー**: 複数のCeleryワーカー
- **用途**:
  - レースデータ取得ジョブ
  - オッズ更新ジョブ
  - 結果取得ジョブ
  - ランキング更新ジョブ

### APScheduler

- **理由**: Python用の高度なスケジューラー
- **用途**:
  - 定期ジョブのスケジューリング
  - Cron形式のスケジュール

## インフラ

### Vercel

- **用途**: Next.jsフロントエンドのホスティング
- **機能**:
  - 自動デプロイ
  - プレビューデプロイ
  - CDN
  - Edge Functions

### Railway / Render

- **用途**: FastAPIバックエンドのホスティング
- **機能**:
  - 自動デプロイ
  - スケーリング
  - 環境変数管理
  - ログ管理

### Supabase

- **用途**:
  - PostgreSQLデータベース
  - Supabase Auth
  - リアルタイム機能
- **機能**:
  - 自動バックアップ
  - 接続プーリング
  - RLS

### Upstash

- **用途**: Redisキャッシュ
- **機能**:
  - サーバーレス
  - 自動スケーリング
  - グローバルレプリケーション

## 開発ツール

### バージョン管理
- **Git**: ソースコード管理
- **GitHub**: リポジトリホスティング

### パッケージ管理

#### Node.js
- **npm** または **pnpm**: Next.jsプロジェクト

#### Python
- **Poetry** または **pipenv**: FastAPIプロジェクト
- **pip**: シンプルな依存関係管理

### コード品質

#### TypeScript
- **ESLint**: リンター
- **Prettier**: コードフォーマッター
- **TypeScript**: 型チェック

#### Python
- **black**: コードフォーマッター
- **flake8** または **ruff**: リンター
- **mypy**: 型チェック
- **pytest**: テストフレームワーク

### モニタリング

#### アプリケーション
- **Vercel Analytics**: Next.jsパフォーマンス
- **Sentry**: エラー追跡
- **Logtail**: ログ集約

#### Celery
- **Flower**: Celery監視ツール

## 環境変数

### Next.js

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_API_URL=https://api.example.com
```

### FastAPI

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
CELERY_BROKER_URL=redis://...
CELERY_RESULT_BACKEND=redis://...
```

## デプロイメントフロー

### 開発環境

1. **Next.js**: Vercelプレビューデプロイ
2. **FastAPI**: Railway/Render開発環境
3. **Celery**: ローカル実行

### 本番環境

1. **Next.js**: Vercel本番デプロイ
2. **FastAPI**: Railway/Render本番デプロイ
3. **Celery**: Railway/Renderでワーカー実行

## セキュリティ

### 認証
- Supabase AuthによるJWT認証
- Row Level Security (RLS)

### API保護
- CORS設定
- レート制限
- JWT検証

### データ保護
- HTTPS必須
- 環境変数による機密情報管理
- SQLインジェクション対策

