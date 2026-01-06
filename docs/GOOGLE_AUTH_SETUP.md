# Google認証の設定手順

このドキュメントでは、SupabaseでGoogle認証を有効化する手順を説明します。

## 📋 前提条件

- Supabaseプロジェクトが作成済みであること
- Googleアカウントを持っていること

## 🔧 設定手順

### 1. Google Cloud ConsoleでOAuth認証情報を作成

#### 1.1 プロジェクトの作成（既存のプロジェクトがある場合はスキップ）

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択または新規作成
   - プロジェクト名: `keiba-champ`（任意）

#### 1.2 OAuth同意画面の設定

1. 左メニューから「APIとサービス」→「OAuth同意画面」を選択
2. ユーザータイプを選択
   - **外部**（一般公開アプリの場合）
   - **内部**（Google Workspace内のみの場合）
3. アプリ情報を入力：
   - **アプリ名**: `競馬チャンプ`（任意）
   - **ユーザーサポートメール**: あなたのメールアドレス
   - **デベロッパーの連絡先情報**: あなたのメールアドレス
4. 「保存して次へ」をクリック
5. スコープ画面で「保存して次へ」をクリック（デフォルトのまま）
6. テストユーザー画面で「保存して次へ」をクリック（必要に応じてテストユーザーを追加）
7. 概要画面で「ダッシュボードに戻る」をクリック

#### 1.3 OAuth認証情報の作成

1. 左メニューから「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「OAuth クライアント ID」をクリック
3. アプリケーションの種類を選択：
   - **ウェブアプリケーション**
4. 名前を入力（例: `競馬チャンプ Web Client`）
5. **承認済みのリダイレクト URI** を追加：
   ```
   https://<your-project-id>.supabase.co/auth/v1/callback
   ```
   - `<your-project-id>` はSupabaseプロジェクトIDに置き換えてください
   - 例: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
6. 「作成」をクリック
7. **クライアントID** と **クライアントシークレット** をコピー（後で使用します）

### 2. SupabaseでGoogle認証を有効化

#### 2.1 Supabaseダッシュボードにアクセス

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. プロジェクトを選択

#### 2.2 認証プロバイダーの設定

1. 左メニューから「Authentication」→「Providers」を選択
2. 「Google」を探してクリック
3. 「Enable Google」トグルをONにする
4. 以下の情報を入力：
   - **Client ID (for OAuth)**: Google Cloud Consoleで取得したクライアントID
   - **Client Secret (for OAuth)**: Google Cloud Consoleで取得したクライアントシークレット
5. 「Save」をクリック

#### 2.3 リダイレクトURLの確認

Supabaseは自動的にリダイレクトURLを設定しますが、確認してください：

1. 「Authentication」→「URL Configuration」を選択
2. **Redirect URLs** に以下が含まれていることを確認：
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```
   - 開発環境用の `http://localhost:3000/auth/callback` を追加（まだない場合）

### 3. 動作確認

#### 3.1 ローカル環境でのテスト

1. フロントエンドを起動：
   ```bash
   cd frontend
   npm run dev
   ```

2. ブラウザで http://localhost:3000/login にアクセス

3. 「Googleでログイン」ボタンをクリック

4. Googleの認証画面が表示され、ログインできることを確認

#### 3.2 よくある問題と解決方法

**問題: "redirect_uri_mismatch" エラーが表示される**

- **原因**: Google Cloud Consoleで設定したリダイレクトURIとSupabaseのリダイレクトURIが一致していない
- **解決方法**:
  1. Supabaseダッシュボード → Authentication → URL Configuration でリダイレクトURLを確認
  2. Google Cloud Console → 認証情報 → OAuth 2.0 クライアント ID で、そのURLを追加

**問題: "access_denied" エラーが表示される**

- **原因**: OAuth同意画面の設定が未完了、またはテストユーザーに追加されていない
- **解決方法**:
  1. Google Cloud Console → OAuth同意画面 で設定を完了
  2. 外部アプリの場合、公開するかテストユーザーに追加

**問題: 認証後、ダッシュボードにリダイレクトされない**

- **原因**: `/auth/callback` ルートの設定に問題がある可能性
- **解決方法**:
  1. `frontend/src/app/auth/callback/route.ts` が正しく設定されているか確認
  2. SupabaseのリダイレクトURL設定を確認

## 🔒 セキュリティのベストプラクティス

1. **クライアントシークレットの管理**
   - クライアントシークレットは環境変数やシークレット管理ツールで管理
   - コードリポジトリに直接コミットしない

2. **リダイレクトURLの制限**
   - 本番環境では、許可されたドメインのみをリダイレクトURLに設定
   - ワイルドカードは使用しない

3. **OAuth同意画面の設定**
   - 本番環境では、適切なプライバシーポリシーと利用規約を設定
   - 必要なスコープのみを要求

## 📚 参考リンク

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Provider Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)

## ✅ チェックリスト

設定が完了したら、以下を確認してください：

- [ ] Google Cloud ConsoleでOAuth認証情報を作成
- [ ] OAuth同意画面を設定
- [ ] リダイレクトURIを正しく設定
- [ ] SupabaseでGoogleプロバイダーを有効化
- [ ] クライアントIDとシークレットを設定
- [ ] ローカル環境でログインが動作することを確認
- [ ] 本番環境のリダイレクトURLを設定（本番デプロイ時）

---

**設定完了後、Googleアカウントでログインできるようになります！** 🎉

