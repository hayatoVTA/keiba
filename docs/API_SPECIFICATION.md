# API仕様

## ベースURL

### FastAPI (バックエンドAPI)
```
開発環境: http://localhost:8000/api
本番環境: https://api.your-domain.com/api
```

### Supabase Auth (認証)
```
開発環境: https://<project-id>.supabase.co/auth/v1
本番環境: https://<project-id>.supabase.co/auth/v1
```

## 認証

### 認証方式

- **Supabase Auth**: 認証はSupabase Authを使用
- **JWT (JSON Web Token)**: Supabase Authが発行するJWTトークン
- **Cookie**: Supabase Authが管理するセッションCookie

### 認証ヘッダー

FastAPIエンドポイントへのリクエスト時：

```
Authorization: Bearer <supabase_jwt_token>
```

### Supabase Auth SDK

Next.jsクライアントでは、Supabase JavaScript SDKを使用：

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ログイン
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// 認証済みリクエスト
const { data, error } = await supabase
  .from('races')
  .select('*')
```

### FastAPIでの認証検証

FastAPIエンドポイントでは、Supabase JWTを検証：

```python
from fastapi import Depends, HTTPException
from supabase import create_client, Client

async def verify_token(token: str = Depends(oauth2_scheme)):
    # Supabase JWT検証
    # ...
    return user
```

## エラーレスポンス

すべてのエラーは以下の形式で返却されます：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {}
  }
}
```

### エラーコード

- `UNAUTHORIZED`: 認証が必要
- `FORBIDDEN`: 権限が不足
- `NOT_FOUND`: リソースが見つからない
- `BAD_REQUEST`: リクエストが不正
- `VALIDATION_ERROR`: バリデーションエラー
- `INTERNAL_ERROR`: サーバーエラー

## エンドポイント一覧

### 認証関連（Supabase Auth）

認証はSupabase Authを使用するため、以下のエンドポイントはSupabase SDK経由で利用します。

#### ユーザー登録

**Supabase SDK使用:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      display_name: 'ユーザー名'
    }
  }
})
```

#### ログイン

**Supabase SDK使用:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

#### ログアウト

**Supabase SDK使用:**
```typescript
const { error } = await supabase.auth.signOut()
```

#### 現在のユーザー情報取得

**Supabase SDK使用:**
```typescript
const { data: { user } } = await supabase.auth.getUser()
```

**FastAPIエンドポイント（追加情報取得）:**

#### GET /api/user/profile

現在のユーザーのプロフィール情報取得（コイン、統計等）

**認証**: 必須

**レスポンス:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "ユーザー名",
    "avatar": "https://...",
    "coins": 10000,
    "totalBets": 50,
    "totalWins": 20,
    "winRate": 40.0,
    "rank": 15,
    "isPremium": false
  }
}
```

### レース関連（FastAPI）

#### GET /api/races

レース一覧取得

**クエリパラメータ:**
- `date`: 日付 (YYYY-MM-DD)
- `venue`: 競馬場名
- `status`: 状態 (upcoming, betting, running, finished)
- `page`: ページ番号 (デフォルト: 1)
- `limit`: 1ページあたりの件数 (デフォルト: 20)

**レスポンス:**
```json
{
  "races": [
    {
      "id": "uuid",
      "date": "2024-01-01",
      "venue": "東京競馬場",
      "raceNumber": 1,
      "raceName": "レース名",
      "distance": 1600,
      "surface": "turf",
      "condition": "良",
      "status": "betting",
      "startTime": "2024-01-01T12:00:00Z",
      "bettingStartTime": "2024-01-01T11:30:00Z",
      "bettingEndTime": "2024-01-01T11:55:00Z",
      "horses": [
        {
          "number": 1,
          "name": "馬名",
          "jockey": "騎手名",
          "odds": 3.5,
          "popularity": 1
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### GET /api/races/:id

レース詳細取得

**レスポンス:**
```json
{
  "race": {
    "id": "uuid",
    "date": "2024-01-01",
    "venue": "東京競馬場",
    "raceNumber": 1,
    "raceName": "レース名",
    "distance": 1600,
    "surface": "turf",
    "condition": "良",
    "weather": "晴",
    "status": "betting",
    "startTime": "2024-01-01T12:00:00Z",
    "bettingStartTime": "2024-01-01T11:30:00Z",
    "bettingEndTime": "2024-01-01T11:55:00Z",
    "horses": [
      {
        "number": 1,
        "name": "馬名",
        "jockey": "騎手名",
        "trainer": "調教師名",
        "weight": 57.0,
        "odds": 3.5,
        "popularity": 1,
        "age": 4,
        "sex": "male",
        "previousResults": [1, 2, 3, 1, 2]
      }
    ],
    "result": null
  }
}
```

### 予想関連

#### POST /api/bets

予想作成

**リクエスト:**
```json
{
  "raceId": "uuid",
  "betType": "win",
  "selections": [1],
  "amount": 100
}
```

**レスポンス:**
```json
{
  "bet": {
    "id": "uuid",
    "raceId": "uuid",
    "betType": "win",
    "selections": [1],
    "amount": 100,
    "odds": 3.5,
    "status": "pending",
    "createdAt": "2024-01-01T11:40:00Z"
  },
  "user": {
    "coins": 9900
  }
}
```

#### GET /api/bets

予想履歴取得

**クエリパラメータ:**
- `status`: 状態 (pending, won, lost)
- `raceId`: レースID
- `page`: ページ番号
- `limit`: 1ページあたりの件数

**レスポンス:**
```json
{
  "bets": [
    {
      "id": "uuid",
      "raceId": "uuid",
      "raceName": "レース名",
      "betType": "win",
      "selections": [1],
      "amount": 100,
      "odds": 3.5,
      "status": "won",
      "payout": 350,
      "createdAt": "2024-01-01T11:40:00Z",
      "settledAt": "2024-01-01T12:10:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### GET /api/bets/:id

予想詳細取得

**レスポンス:**
```json
{
  "bet": {
    "id": "uuid",
    "raceId": "uuid",
    "race": {
      "raceName": "レース名",
      "date": "2024-01-01",
      "venue": "東京競馬場"
    },
    "betType": "win",
    "selections": [1],
    "amount": 100,
    "odds": 3.5,
    "status": "won",
    "payout": 350,
    "createdAt": "2024-01-01T11:40:00Z",
    "settledAt": "2024-01-01T12:10:00Z"
  }
}
```

### コイン関連

#### GET /api/coins/balance

コイン残高取得

**レスポンス:**
```json
{
  "coins": 10000
}
```

#### GET /api/coins/transactions

コイン取引履歴取得

**クエリパラメータ:**
- `type`: 種類 (earn, spend, purchase, bonus)
- `startDate`: 開始日 (YYYY-MM-DD)
- `endDate`: 終了日 (YYYY-MM-DD)
- `page`: ページ番号
- `limit`: 1ページあたりの件数

**レスポンス:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "earn",
      "amount": 350,
      "balance": 10350,
      "reason": "予想的中",
      "metadata": {
        "raceId": "uuid",
        "betId": "uuid"
      },
      "createdAt": "2024-01-01T12:10:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### POST /api/coins/purchase

コイン購入

**リクエスト:**
```json
{
  "packageId": "1000_coins",
  "paymentMethodId": "pm_xxx"
}
```

**レスポンス:**
```json
{
  "transaction": {
    "id": "uuid",
    "type": "purchase",
    "amount": 1000,
    "balance": 11000,
    "createdAt": "2024-01-01T12:00:00Z"
  },
  "payment": {
    "id": "pi_xxx",
    "status": "succeeded"
  }
}
```

#### POST /api/coins/bonus/daily

デイリーボーナス獲得

**レスポンス:**
```json
{
  "transaction": {
    "id": "uuid",
    "type": "bonus",
    "amount": 100,
    "balance": 10100,
    "reason": "デイリーボーナス",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/coins/bonus/ad

広告視聴ボーナス獲得

**リクエスト:**
```json
{
  "adType": "video"
}
```

**レスポンス:**
```json
{
  "transaction": {
    "id": "uuid",
    "type": "bonus",
    "amount": 50,
    "balance": 10050,
    "reason": "広告視聴",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### ランキング関連

#### GET /api/ranking/assets

総資産ランキング取得

**クエリパラメータ:**
- `page`: ページ番号
- `limit`: 1ページあたりの件数

**レスポンス:**
```json
{
  "ranking": [
    {
      "rank": 1,
      "user": {
        "id": "uuid",
        "displayName": "ユーザー名",
        "avatar": "https://...",
        "coins": 50000
      }
    }
  ],
  "myRank": {
    "rank": 15,
    "coins": 10000
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1000,
    "totalPages": 50
  }
}
```

#### GET /api/ranking/profit

収支ランキング取得

**クエリパラメータ:**
- `period`: 期間 (daily, weekly, monthly, all)
- `page`: ページ番号
- `limit`: 1ページあたりの件数

**レスポンス:**
```json
{
  "ranking": [
    {
      "rank": 1,
      "user": {
        "id": "uuid",
        "displayName": "ユーザー名",
        "avatar": "https://...",
        "netProfit": 50000
      }
    }
  ],
  "myRank": {
    "rank": 15,
    "netProfit": 10000
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1000,
    "totalPages": 50
  }
}
```

#### GET /api/ranking/win-rate

的中率ランキング取得

**クエリパラメータ:**
- `page`: ページ番号
- `limit`: 1ページあたりの件数

**レスポンス:**
```json
{
  "ranking": [
    {
      "rank": 1,
      "user": {
        "id": "uuid",
        "displayName": "ユーザー名",
        "avatar": "https://...",
        "winRate": 75.5,
        "totalBets": 100,
        "totalWins": 75
      }
    }
  ],
  "myRank": {
    "rank": 15,
    "winRate": 40.0,
    "totalBets": 50,
    "totalWins": 20
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1000,
    "totalPages": 50
  }
}
```

### プロフィール関連

#### GET /api/profile/:userId

ユーザープロフィール取得

**レスポンス:**
```json
{
  "user": {
    "id": "uuid",
    "displayName": "ユーザー名",
    "avatar": "https://...",
    "coins": 10000,
    "totalBets": 50,
    "totalWins": 20,
    "totalEarnings": 50000,
    "totalSpent": 40000,
    "winRate": 40.0,
    "rank": 15,
    "isPremium": false,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "badges": [
    {
      "id": "uuid",
      "name": "初勝利",
      "description": "初めて予想が的中",
      "icon": "https://...",
      "earnedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "stats": {
    "favoriteBetType": "win",
    "favoriteVenue": "東京競馬場",
    "bestWin": {
      "raceName": "レース名",
      "payout": 10000
    }
  }
}
```

#### PATCH /api/profile

プロフィール更新

**リクエスト:**
```json
{
  "displayName": "新しいユーザー名",
  "avatar": "https://..."
}
```

**レスポンス:**
```json
{
  "user": {
    "id": "uuid",
    "displayName": "新しいユーザー名",
    "avatar": "https://...",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

### プレミアム関連

#### GET /api/premium/plans

プレミアムプラン一覧取得

**レスポンス:**
```json
{
  "plans": [
    {
      "id": "monthly",
      "name": "月額プラン",
      "price": 980,
      "duration": 30,
      "features": [
        "広告非表示",
        "詳細レース分析",
        "優先サポート"
      ]
    },
    {
      "id": "yearly",
      "name": "年額プラン",
      "price": 9800,
      "duration": 365,
      "discount": 17,
      "features": [
        "広告非表示",
        "詳細レース分析",
        "優先サポート"
      ]
    }
  ]
}
```

#### POST /api/premium/subscribe

プレミアムサブスクリプション開始

**リクエスト:**
```json
{
  "planId": "monthly",
  "paymentMethodId": "pm_xxx"
}
```

**レスポンス:**
```json
{
  "subscription": {
    "id": "uuid",
    "planType": "monthly",
    "status": "active",
    "startedAt": "2024-01-01T12:00:00Z",
    "expiresAt": "2024-02-01T12:00:00Z"
  },
  "payment": {
    "id": "pi_xxx",
    "status": "succeeded"
  }
}
```

#### DELETE /api/premium/subscribe

プレミアムサブスクリプション解約

**レスポンス:**
```json
{
  "subscription": {
    "id": "uuid",
    "status": "cancelled",
    "expiresAt": "2024-02-01T12:00:00Z"
  }
}
```

## レート制限

各エンドポイントにはレート制限が設定されています：

- **認証関連**: 10回/分
- **レース取得**: 60回/分
- **予想作成**: 10回/分
- **コイン購入**: 5回/分
- **その他**: 100回/分

レート制限に達した場合、以下のヘッダーが返却されます：

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200
```

## WebSocket（将来実装）

リアルタイム更新のためにWebSocketを検討：

- **レースオッズ更新**: `/ws/races/:id/odds`
- **ランキング更新**: `/ws/ranking`
- **予想結果通知**: `/ws/bets/:id`

