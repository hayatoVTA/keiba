# Python ベースイメージ
FROM python:3.11-slim

# 作業ディレクトリ
WORKDIR /app

# システム依存関係インストール
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Playwright 用の依存関係（スクレイピング用）
# 必要な場合のみコメント解除
# RUN apt-get update && apt-get install -y \
#     libnss3 \
#     libnspr4 \
#     libatk1.0-0 \
#     libatk-bridge2.0-0 \
#     libcups2 \
#     libdrm2 \
#     libxkbcommon0 \
#     libxcomposite1 \
#     libxdamage1 \
#     libxfixes3 \
#     libxrandr2 \
#     libgbm1 \
#     libasound2 \
#     && rm -rf /var/lib/apt/lists/*

# Python 依存関係インストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Playwright ブラウザインストール（スクレイピング用）
# 必要な場合のみコメント解除
# RUN playwright install chromium

# アプリケーションコードをコピー
COPY . .

# ポート公開
EXPOSE 8000

# FastAPI サーバー起動
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

