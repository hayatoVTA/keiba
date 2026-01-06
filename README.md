# 競馬チャンプ 🏇

実際の競馬レースを使って、ゲーム内コインで予想を楽しめる無料の競馬予想ゲームです。

## 🎯 MVP機能

### 馬の予想機能
- 単勝（1着を予想）
- 複勝（3着以内を予想）
- レース一覧・詳細表示
- 予想フォーム
- 予想履歴

### ゲーム内コイン機能
- 新規登録ボーナス（10,000コイン）
- ログインボーナス（毎日100コイン）
- 連続ログインボーナス（3日/7日/14日/30日）
- コイン残高管理
- コイン取引履歴

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** - UIコンポーネント
- **Zustand** - 状態管理
- **TanStack Query** - サーバー状態管理
- **Supabase** - 認証

### バックエンド
- **FastAPI** (Python)
- **Supabase** - PostgreSQL + Auth
- **Pydantic** - データバリデーション

### データベース
- **PostgreSQL** (Supabase)
- **Prisma** - スキーマ管理・マイグレーション

## 📁 プロジェクト構造

```
keiba-app/
├── frontend/                 # Next.js フロントエンド
│   ├── src/
│   │   ├── app/             # App Router ページ
│   │   │   ├── (auth)/      # 認証ページ
│   │   │   ├── (protected)/ # 認証必須ページ
│   │   │   ├── races/       # レース関連ページ
│   │   │   └── ...
│   │   ├── components/      # UIコンポーネント
│   │   │   ├── layout/      # レイアウトコンポーネント
│   │   │   └── ui/          # shadcn/ui コンポーネント
│   │   ├── lib/             # ユーティリティ
│   │   │   ├── api.ts       # APIクライアント
│   │   │   └── supabase/    # Supabase設定
│   │   ├── providers/       # Reactプロバイダー
│   │   └── stores/          # Zustand ストア
│   └── prisma/
│       └── schema.prisma    # データベーススキーマ
│
├── backend/                  # FastAPI バックエンド
│   ├── app/
│   │   ├── api/             # APIエンドポイント
│   │   │   ├── users.py     # ユーザー関連
│   │   │   ├── races.py     # レース関連
│   │   │   ├── bets.py      # 予想関連
│   │   │   ├── coins.py     # コイン関連
│   │   │   └── ranking.py   # ランキング関連
│   │   ├── models/          # Pydanticモデル
│   │   ├── services/        # ビジネスロジック
│   │   ├── scrapers/        # スクレイピング
│   │   └── tasks/           # Celeryタスク
│   ├── tests/
│   └── requirements.txt
│
└── docs/                     # ドキュメント
```

## 🚀 セットアップ

### 前提条件
- Docker & Docker Compose（推奨）
- または Node.js 18+ / Python 3.11+
- Supabaseアカウント

### 🐳 Docker を使用する場合（推奨）

```bash
# 1. 環境変数ファイルを作成
cp .env.example .env
# .env を編集してSupabaseの設定を追加

# 2. 開発環境を起動
make dev

# または
docker-compose -f docker-compose.dev.yml up
```

#### 便利なコマンド

```bash
make dev          # 開発環境を起動（ホットリロード有効）
make down         # コンテナを停止
make logs         # ログを表示
make build        # イメージをビルド
make clean        # コンテナとボリュームを削除

# 個別サービス
make frontend     # フロントエンドのみ起動
make backend      # バックエンドのみ起動

# シェル接続
make shell-frontend   # フロントエンドコンテナにシェル接続
make shell-backend    # バックエンドコンテナにシェル接続
```

### ローカル環境を使用する場合

#### フロントエンド

```bash
cd frontend

# 依存関係インストール
npm install

# 環境変数設定
cp .env.local.example .env.local
# .env.local を編集してSupabaseの設定を追加

# 開発サーバー起動
npm run dev
```

#### バックエンド

```bash
cd backend

# 仮想環境作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r requirements.txt

# 環境変数設定（プロジェクトルートの.envを使用）

# 開発サーバー起動
uvicorn app.main:app --reload --port 8000
```

### データベース

```bash
cd frontend

# Prismaマイグレーション実行
npx prisma migrate dev

# Prismaスタジオ起動（DB確認）
npx prisma studio
```

## 📝 API仕様

### 認証
- Supabase Authを使用
- Google認証（OAuth 2.0）
- JWT認証
- 詳細な設定手順は [Google認証の設定手順](./docs/GOOGLE_AUTH_SETUP.md) を参照

### 主要エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/races` | レース一覧取得 |
| GET | `/api/races/:id` | レース詳細取得 |
| POST | `/api/bets` | 予想作成 |
| GET | `/api/bets` | 予想履歴取得 |
| GET | `/api/coins/balance` | コイン残高取得 |
| POST | `/api/user/register-bonus` | 登録ボーナス取得 |
| POST | `/api/user/login-bonus` | ログインボーナス取得 |

詳細は `/docs` (Swagger UI) を参照

## 🎮 使い方

1. **アカウント登録**: Googleアカウントで無料登録
2. **ボーナス獲得**: 登録で10,000コイン、毎日ログインで100コイン
3. **レース選択**: 予想したいレースを選ぶ
4. **予想タイプ選択**: 単勝または複勝を選ぶ
5. **馬を選択**: 予想する馬をクリック
6. **賭け金入力**: 10〜10,000コインで設定
7. **予想確定**: 的中すれば賭け金×オッズのコインを獲得！

## 📄 ライセンス

Private - All rights reserved

## 👥 開発チーム

競馬チャンプ開発チーム

