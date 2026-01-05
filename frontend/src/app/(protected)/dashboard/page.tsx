'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { useUserStore } from '@/stores/user-store'
import { userApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Coins,
  Target,
  TrendingUp,
  Trophy,
  Gift,
  ChevronRight,
  Calendar,
  Loader2
} from 'lucide-react'

export default function DashboardPage() {
  const { session } = useAuth()
  const { user, updateCoins, updateStats } = useUserStore()
  const [loginBonusClaimed, setLoginBonusClaimed] = useState(false)
  const [loginBonusLoading, setLoginBonusLoading] = useState(false)
  const [loginBonusResult, setLoginBonusResult] = useState<{
    bonus: number
    consecutiveDays: number
  } | null>(null)

  // ログインボーナスを取得
  const claimLoginBonus = async () => {
    if (!session?.access_token) return

    setLoginBonusLoading(true)
    try {
      const result = await userApi.claimLoginBonus(session.access_token) as {
        bonus_claimed: boolean
        bonus: number
        consecutive_days: number
        coins: number
      }

      if (result.bonus_claimed) {
        setLoginBonusResult({
          bonus: result.bonus,
          consecutiveDays: result.consecutive_days
        })
        updateCoins(result.coins)
        updateStats({ consecutiveLoginDays: result.consecutive_days })
      }
      setLoginBonusClaimed(true)
    } catch (error) {
      console.error('Failed to claim login bonus:', error)
    } finally {
      setLoginBonusLoading(false)
    }
  }

  useEffect(() => {
    // 自動でログインボーナスを確認
    if (session?.access_token && !loginBonusClaimed) {
      claimLoginBonus()
    }
  }, [session?.access_token])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ログインボーナス通知 */}
      {loginBonusResult && (
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/30 flex items-center justify-center">
                <Gift className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-100">ログインボーナス獲得！</h3>
                <p className="text-yellow-300/80">
                  {loginBonusResult.consecutiveDays}日連続ログイン • +{loginBonusResult.bonus.toLocaleString()}コイン
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-yellow-400"
              onClick={() => setLoginBonusResult(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* ウェルカムヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-amber-100">
          こんにちは、{user?.displayName || 'ゲスト'}さん 🏇
        </h1>
        <p className="text-amber-400/70 mt-2">
          今日も予想を楽しみましょう
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-xs text-yellow-300/70">コイン残高</p>
                <p className="text-2xl font-bold text-yellow-100">
                  {user?.coins?.toLocaleString() || '---'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-xs text-green-300/70">的中率</p>
                <p className="text-2xl font-bold text-green-100">
                  {user?.winRate?.toFixed(1) || '0.0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-xs text-blue-300/70">総予想数</p>
                <p className="text-2xl font-bold text-blue-100">
                  {user?.totalBets?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-xs text-purple-300/70">ランキング</p>
                <p className="text-2xl font-bold text-purple-100">
                  {user?.rank ? `${user.rank}位` : '---'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-amber-950/50 border-amber-800/50 hover:border-amber-600/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-amber-100 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-400" />
              今日のレース
            </CardTitle>
            <CardDescription className="text-amber-400/70">
              予想受付中のレースをチェック
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/races">
              <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-950 font-bold hover:from-yellow-400 hover:to-amber-400">
                レース一覧へ
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-amber-950/50 border-amber-800/50 hover:border-amber-600/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-amber-100 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              ランキング
            </CardTitle>
            <CardDescription className="text-amber-400/70">
              全国のユーザーと競い合おう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/ranking">
              <Button variant="outline" className="w-full border-amber-700 text-amber-200 hover:bg-amber-800/50">
                ランキングを見る
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 連続ログイン情報 */}
      <Card className="bg-amber-950/50 border-amber-800/50">
        <CardHeader>
          <CardTitle className="text-amber-100 flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-400" />
            ログインボーナス
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-200">
                現在 <span className="font-bold text-yellow-400">{user?.consecutiveLoginDays || 0}日連続</span> ログイン中
              </p>
              <p className="text-sm text-amber-400/70 mt-1">
                {user?.consecutiveLoginDays && user.consecutiveLoginDays >= 7
                  ? user.consecutiveLoginDays >= 14
                    ? user.consecutiveLoginDays >= 30
                      ? '30日連続達成！最大ボーナス獲得中 🎉'
                      : `あと${30 - user.consecutiveLoginDays}日で30日連続ボーナス！`
                    : `あと${14 - user.consecutiveLoginDays}日で14日連続ボーナス！`
                  : `あと${7 - (user?.consecutiveLoginDays || 0)}日で7日連続ボーナス！`
                }
              </p>
            </div>
            <div className="text-right">
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                毎日100コイン
              </Badge>
            </div>
          </div>

          {/* 連続ログインの進捗 */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[3, 7, 14, 30].map((day) => (
              <div
                key={day}
                className={`p-3 rounded-lg text-center ${
                  (user?.consecutiveLoginDays || 0) >= day
                    ? 'bg-yellow-500/20 border border-yellow-500/30'
                    : 'bg-amber-900/30 border border-amber-800/30'
                }`}
              >
                <p className="text-xs text-amber-400/70">{day}日</p>
                <p className={`font-bold ${
                  (user?.consecutiveLoginDays || 0) >= day ? 'text-yellow-400' : 'text-amber-600'
                }`}>
                  +{day === 3 ? 50 : day === 7 ? 200 : day === 14 ? 500 : 2000}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

