# 🚀 クイックスタートガイド

## 5分で始める

### 1. Supabaseプロジェクト作成（2分）

1. https://supabase.com にアクセス
2. アカウント作成（無料）
3. 「New Project」をクリック
4. プロジェクト名を入力（例: `keiba-champ`）
5. データベースパスワードを設定
6. リージョンを選択（`Tokyo`推奨）
7. 「Create new project」をクリック

### 2. 環境変数を設定（1分）

```bash
# プロジェクトルートで実行
cp .env.example .env
```

`.env` ファイルを開いて、Supabaseの設定を追加：

1. Supabaseダッシュボード → Settings → API
2. 以下の値をコピーして `.env` に貼り付け：

```env
# フロントエンド用
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# バックエンド用
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # service_role key
SUPABASE_JWT_SECRET=your-jwt-secret  # Settings → API → JWT Secret

# データベース
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### 3. データベースマイグレーション（1分）

```bash
cd frontend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. 開発環境を起動（1分）

```bash
# プロジェクトルートに戻る
cd ..

# Dockerで起動
make dev

# または個別に起動
make frontend  # フロントエンドのみ
make backend   # バックエンドのみ
```

### 5. 動作確認

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000/docs
- **Prisma Studio**: `cd frontend && npx prisma studio`

---

## テストデータの投入

```bash
# シードデータを投入
make seed

# または直接実行
./scripts/seed-db.sh
```

これで以下のデータが作成されます：
- サンプルレース（2件）
- 出走馬データ
- バッジマスターデータ

---

## 次のステップ

詳細は [NEXT_STEPS.md](./NEXT_STEPS.md) を参照してください。

### すぐに試せること

1. **Google認証の設定**
   - Google認証を使用する場合は、[Google認証の設定手順](./docs/GOOGLE_AUTH_SETUP.md)を参照してください
   - SupabaseダッシュボードでGoogleプロバイダーを有効化する必要があります

2. **ログイン**
   - http://localhost:3000/login にアクセス
   - Googleアカウントでログイン
   - ログインボーナスが付与される

3. **レース一覧**
   - http://localhost:3000/races にアクセス
   - サンプルレースが表示される

4. **予想作成**
   - レース詳細ページで予想を作成
   - コイン残高が更新される

---

## トラブルシューティング

### 環境変数が読み込まれない
```bash
# .env ファイルが正しい場所にあるか確認
ls -la .env

# Dockerを使用している場合、再起動
make down
make dev
```

### データベース接続エラー
```bash
# DATABASE_URLが正しいか確認
# Supabaseダッシュボード → Settings → Database → Connection string
```

### Prismaマイグレーションエラー
```bash
# Prismaスキーマを確認
cd frontend
npx prisma validate

# マイグレーションをリセット（開発環境のみ）
npx prisma migrate reset
```

---

## よくある質問

**Q: Dockerを使わずに開発できますか？**
A: はい。各サービスをローカルで起動できます。詳細は README.md を参照。

**Q: Supabaseの無料プランで使えますか？**
A: はい。MVP開発には無料プランで十分です。

**Q: 本番環境へのデプロイ方法は？**
A: Vercel（フロントエンド）と Railway/Render（バックエンド）を推奨。詳細は後日追加予定。

---

**準備完了！開発を始めましょう！** 🎉

