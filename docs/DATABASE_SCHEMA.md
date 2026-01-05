# データベース設計

## スキーマ概要

PostgreSQL（Supabase）を使用します。

**注意**: このドキュメントではPrismaスキーマ形式でテーブル定義を記載していますが、実際の実装では：
- **Next.js（フロントエンド）**: Prisma Client (TypeScript) を使用（必要に応じて）
- **FastAPI（バックエンド）**: Supabase Python SDKを使用してデータベースにアクセス

Prismaスキーマは型定義とマイグレーション管理のためのものです。

## テーブル一覧

1. [User（ユーザー）](#user)
2. [Race（レース）](#race)
3. [Horse（出走馬）](#horse)
4. [Bet（予想）](#bet)
5. [CoinTransaction（コイン取引）](#cointransaction)
6. [Ranking（ランキング）](#ranking)
7. [Badge（バッジ）](#badge)
8. [UserBadge（ユーザーバッジ）](#userbadge)
9. [PremiumSubscription（プレミアムサブスク）](#premiumsubscription)
10. [AdvertisementView（広告視聴）](#advertisementview)

## テーブル詳細

### User

ユーザー情報を管理します。

```prisma
model User {
  id                    String   @id @default(uuid())
  email                 String?  @unique
  emailVerified         DateTime?
  displayName           String
  avatar                String?
  coins                 Int      @default(10000)
  totalBets             Int      @default(0)
  totalWins             Int      @default(0)
  totalEarnings         BigInt   @default(0)
  totalSpent            BigInt   @default(0)
  winRate               Float    @default(0)
  rank                  Int?
  isPremium             Boolean  @default(false)
  premiumExpiresAt      DateTime?
  consecutiveLoginDays  Int      @default(0)
  lastLoginAt           DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relations
  bets                  Bet[]
  coinTransactions      CoinTransaction[]
  badges                UserBadge[]
  premiumSubscription   PremiumSubscription?
  advertisementViews    AdvertisementView[]

  @@index([email])
  @@index([coins])
  @@index([rank])
}
```

### Race

レース情報を管理します。

```prisma
model Race {
  id                String   @id @default(uuid())
  date              DateTime
  venue             String
  raceNumber        Int
  raceName          String
  grade             String?
  distance          Int
  surface           String   // 'turf' | 'dirt'
  condition         String
  weather           String?
  status            String   @default("upcoming") // 'upcoming' | 'betting' | 'running' | 'finished' | 'cancelled'
  startTime         DateTime
  bettingStartTime  DateTime
  bettingEndTime    DateTime
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  horses            Horse[]
  bets              Bet[]
  result            RaceResult?

  @@unique([date, venue, raceNumber])
  @@index([date])
  @@index([status])
  @@index([startTime])
}
```

### Horse

出走馬情報を管理します。

```prisma
model Horse {
  id                String   @id @default(uuid())
  raceId            String
  number            Int
  name              String
  jockey            String
  trainer           String
  weight            Float
  odds              Float
  popularity        Int
  age               Int
  sex               String   // 'male' | 'female'
  previousResults   Int[]    @default([])
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  race              Race     @relation(fields: [raceId], references: [id], onDelete: Cascade)

  @@unique([raceId, number])
  @@index([raceId])
}
```

### RaceResult

レース結果を管理します。

```prisma
model RaceResult {
  id        String   @id @default(uuid())
  raceId    String   @unique
  first     Int
  second    Int
  third     Int
  finishTime String?
  payout    Json     // { win: number, place: number[], exacta: number, wide: number, trio: number, trifecta: number }
  createdAt DateTime @default(now())

  // Relations
  race      Race     @relation(fields: [raceId], references: [id], onDelete: Cascade)

  @@index([raceId])
}
```

### Bet

予想情報を管理します。

```prisma
model Bet {
  id          String   @id @default(uuid())
  userId      String
  raceId      String
  betType     String   // 'win' | 'place' | 'exacta' | 'wide' | 'trio' | 'trifecta'
  selections  Int[]
  amount      Int
  odds        Float
  status      String   @default("pending") // 'pending' | 'won' | 'lost' | 'refunded'
  payout      BigInt?
  createdAt   DateTime @default(now())
  settledAt   DateTime?

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  race        Race     @relation(fields: [raceId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([raceId])
  @@index([status])
  @@index([createdAt])
}
```

### CoinTransaction

コイン取引履歴を管理します。

```prisma
model CoinTransaction {
  id          String   @id @default(uuid())
  userId      String
  type        String   // 'earn' | 'spend' | 'purchase' | 'bonus' | 'refund'
  amount      BigInt
  balance     BigInt
  reason      String
  metadata    Json?    // 追加情報（レースID、予想ID等）
  createdAt   DateTime @default(now())

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type])
  @@index([createdAt])
}
```

### Ranking

ランキング情報を管理します。

```prisma
model Ranking {
  id              String   @id @default(uuid())
  userId          String   @unique
  totalAssets     BigInt   @default(0)
  netProfit       BigInt   @default(0)
  winRate         Float    @default(0)
  weeklyProfit    BigInt   @default(0)
  monthlyProfit   BigInt   @default(0)
  totalAssetsRank Int?
  netProfitRank   Int?
  winRateRank     Int?
  weeklyRank      Int?
  monthlyRank     Int?
  updatedAt       DateTime @updatedAt

  // Relations
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([totalAssets])
  @@index([netProfit])
  @@index([winRate])
  @@index([weeklyProfit])
  @@index([monthlyProfit])
}
```

### Badge

バッジマスターを管理します。

```prisma
model Badge {
  id          String   @id @default(uuid())
  name        String   @unique
  description String
  icon        String
  category    String   // 'ranking' | 'achievement' | 'premium'
  condition   Json?    // 獲得条件
  createdAt   DateTime @default(now())

  // Relations
  userBadges  UserBadge[]

  @@index([category])
}
```

### UserBadge

ユーザーが獲得したバッジを管理します。

```prisma
model UserBadge {
  id        String   @id @default(uuid())
  userId    String
  badgeId   String
  earnedAt  DateTime @default(now())

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge     Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
  @@index([userId])
}
```

### PremiumSubscription

プレミアムサブスクリプション情報を管理します。

```prisma
model PremiumSubscription {
  id            String   @id @default(uuid())
  userId        String   @unique
  planType      String   // 'monthly' | 'yearly'
  status        String   // 'active' | 'cancelled' | 'expired'
  startedAt     DateTime @default(now())
  expiresAt     DateTime
  cancelledAt   DateTime?
  stripeSubscriptionId String? @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([expiresAt])
}
```

### AdvertisementView

広告視聴履歴を管理します（コイン付与のため）。

```prisma
model AdvertisementView {
  id        String   @id @default(uuid())
  userId    String
  adType    String   // 'video' | 'banner'
  coinsEarned Int    @default(50)
  viewedAt  DateTime @default(now())

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([viewedAt])
}
```

## インデックス戦略

### 主要インデックス

1. **User**
   - `email`: ログイン時の検索
   - `coins`: ランキング計算
   - `rank`: ランキング表示

2. **Race**
   - `date`: 日付での検索
   - `status`: 状態でのフィルタ
   - `startTime`: 発走時刻順ソート

3. **Bet**
   - `userId`: ユーザーの予想履歴
   - `raceId`: レースごとの予想
   - `status`: 未確定予想の検索

4. **CoinTransaction**
   - `userId`: ユーザーの取引履歴
   - `createdAt`: 期間指定検索

5. **Ranking**
   - 各ランキング指標: ランキング計算

## データ整合性

### 外部キー制約

- すべてのリレーションに外部キー制約を設定
- `onDelete: Cascade` で親レコード削除時に子レコードも削除

### トランザクション

- コイン操作: トランザクションで整合性を保証
- 予想確定: トランザクションで結果判定と配当計算を実行

## マイグレーション戦略

1. **初期マイグレーション**: すべてのテーブルを作成
2. **段階的追加**: 機能追加に合わせてテーブル・カラムを追加
3. **データ移行**: 必要に応じてデータ移行スクリプトを作成

## パフォーマンス最適化

### 読み取り最適化

- **インデックス**: 頻繁に検索されるカラムにインデックス
- **キャッシュ**: Redisでレースデータ、ランキングをキャッシュ
- **読み取り専用レプリカ**: 将来的に検討

### 書き込み最適化

- **バッチ処理**: ランキング更新はバッチで実行
- **非同期処理**: 重い処理はジョブキューで実行

## バックアップ戦略

- **自動バックアップ**: Supabase/Neonの自動バックアップ機能を使用
- **バックアップ頻度**: 日次
- **保持期間**: 30日間

## 将来実装予定テーブル（ゲーミフィケーション）

製品版以降で実装予定のテーブル設計です。MVPでは実装しません。

### UserLevel（ユーザーレベル）

```prisma
// 将来実装予定
model UserLevel {
  id              String   @id @default(uuid())
  userId          String   @unique
  level           Int      @default(1)
  currentExp      Int      @default(0)
  totalExp        BigInt   @default(0)
  expToNextLevel  Int
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([level])
}
```

### Club（クラブ）

```prisma
// 将来実装予定
model Club {
  id              String   @id @default(uuid())
  name            String
  description     String?
  icon            String?
  masterId        String
  level           Int      @default(1)
  exp             BigInt   @default(0)
  totalAssets     BigInt   @default(0)
  totalProfit     BigInt   @default(0)
  averageWinRate  Float    @default(0)
  maxMembers      Int      @default(10)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  members         ClubMember[]
  missions        ClubMission[]
  rankings        ClubRanking[]

  @@index([masterId])
  @@index([level])
}
```

### ClubMember（クラブメンバー）

```prisma
// 将来実装予定
model ClubMember {
  id          String   @id @default(uuid())
  clubId      String
  userId      String
  role        String   // 'master' | 'subMaster' | 'member'
  contribution BigInt  @default(0)
  joinedAt    DateTime @default(now())

  // Relations
  club        Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([clubId, userId])
  @@index([clubId])
  @@index([userId])
}
```

### ClubMission（クラブミッション）

```prisma
// 将来実装予定
model ClubMission {
  id          String   @id @default(uuid())
  clubId      String
  type        String   // 'bets' | 'wins' | 'profit' | 'ranking'
  target      BigInt
  current     BigInt   @default(0)
  reward      Json     // { coins: number, exp: number, badge?: string }
  status      String   @default("active") // 'active' | 'completed' | 'expired'
  deadline    DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  club        Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)

  @@index([clubId])
  @@index([status])
}
```

### Season（シーズン）

```prisma
// 将来実装予定
model Season {
  id          String   @id @default(uuid())
  number      Int      @unique
  name        String
  startDate   DateTime
  endDate     DateTime
  status      String   @default("upcoming") // 'upcoming' | 'active' | 'ended'
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  rankings    SeasonRanking[]

  @@index([status])
  @@index([startDate])
  @@index([endDate])
}
```

### SeasonRanking（シーズンランキング）

```prisma
// 将来実装予定
model SeasonRanking {
  id          String   @id @default(uuid())
  seasonId    String
  userId      String
  totalAssets BigInt   @default(0)
  netProfit   BigInt   @default(0)
  winRate     Float    @default(0)
  totalBets   Int      @default(0)
  rank        Int?
  reward      Json?    // { coins: number, badges: string[], avatar?: string }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  season      Season   @relation(fields: [seasonId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([seasonId, userId])
  @@index([seasonId])
  @@index([userId])
  @@index([rank])
}
```

