# 🔧 トラブルシューティングガイド

## データベース接続エラー

### エラー: `P1001: Can't reach database server at localhost:51214`

このエラーは、Prismaがデータベースに接続できないことを示しています。

#### 原因
- `DATABASE_URL`環境変数が設定されていない
- 間違った接続文字列が設定されている
- Supabaseのデータベースが起動していない

#### 解決方法

**1. Supabaseの接続文字列を取得**

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. **Settings** → **Database** に移動
4. **Connection string** セクションを開く
5. **URI** を選択
6. 接続文字列をコピー（形式: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`）

**2. `frontend/.env` ファイルを確認・作成**

```bash
cd frontend
cp .env.local.example .env.local
```

**3. `DATABASE_URL` を設定**

`frontend/.env.local` または `frontend/.env` ファイルに以下を追加：

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

**重要**: `[YOUR-PASSWORD]` を実際のパスワードに置き換えてください。

**4. 接続文字列の形式確認**

正しい形式：
```
postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

間違った形式：
```
postgresql://localhost:5432/postgres  ❌
postgresql://postgres@localhost:5432  ❌
```

**5. 接続テスト**

```bash
cd frontend
npx prisma db pull
```

接続が成功すれば、データベーススキーマが取得されます。

---

## その他のよくあるエラー

### エラー: `Environment variable not found: DATABASE_URL`

**解決方法**:
1. `frontend/.env` または `frontend/.env.local` ファイルに `DATABASE_URL` が設定されているか確認
2. ファイルが正しい場所にあるか確認（`frontend/` ディレクトリ内）
3. Prismaコマンドを実行する前に、環境変数が読み込まれているか確認

```bash
# 環境変数を確認
cd frontend
cat .env | grep DATABASE_URL
```

### エラー: `Authentication failed`

**解決方法**:
1. Supabaseのデータベースパスワードが正しいか確認
2. 接続文字列内のパスワードが正しくエンコードされているか確認
3. 特殊文字が含まれる場合は、URLエンコードが必要な場合があります

### エラー: `Connection timeout`

**解決方法**:
1. インターネット接続を確認
2. Supabaseプロジェクトがアクティブか確認
3. ファイアウォールやプロキシの設定を確認

---

## 環境変数の優先順位

Next.jsとPrismaは以下の順序で環境変数を読み込みます：

1. `frontend/.env.local` （最優先、gitignoreに含まれる）
2. `frontend/.env.development` または `frontend/.env.production`
3. `frontend/.env`

**推奨**: 開発環境では `frontend/.env.local` を使用してください。

---

## 接続文字列の取得方法（詳細）

### Supabaseダッシュボードから

1. **Settings** → **Database**
2. **Connection string** セクション
3. **URI** タブを選択
4. 接続文字列をコピー

### 手動で構築する場合

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

- `USER`: `postgres`（通常は固定）
- `PASSWORD`: Supabaseプロジェクト作成時に設定したパスワード
- `HOST`: `db.[PROJECT-REF].supabase.co`
- `PORT`: `5432`（通常は固定）
- `DATABASE`: `postgres`（通常は固定）

**例**:
```
postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

---

## 接続確認コマンド

```bash
# Prismaで接続確認
cd frontend
npx prisma db pull

# または、psqlで直接接続（psqlがインストールされている場合）
psql "postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
```

---

## まだ解決しない場合

1. **Supabaseプロジェクトの状態を確認**
   - プロジェクトが一時停止していないか
   - データベースが起動しているか

2. **ログを確認**
   ```bash
   # Prismaの詳細ログを有効化
   DEBUG=* npx prisma migrate dev
   ```

3. **Prismaを再インストール**
   ```bash
   cd frontend
   rm -rf node_modules/.prisma
   npx prisma generate
   ```

4. **Supabaseサポートに問い合わせ**
   - プロジェクトの接続情報が正しいか確認

---

## チェックリスト

接続エラーが発生した場合、以下を確認してください：

- [ ] `frontend/.env` または `frontend/.env.local` に `DATABASE_URL` が設定されている
- [ ] 接続文字列の形式が正しい（`postgresql://...`）
- [ ] パスワードが正しく設定されている
- [ ] Supabaseプロジェクトがアクティブである
- [ ] インターネット接続が正常である
- [ ] ファイアウォールが接続をブロックしていない

