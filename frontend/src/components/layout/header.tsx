'use client'

import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { useUserStore } from '@/stores/user-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Coins, Trophy, User, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { user, signOut, isLoading } = useAuth()
  const { user: storeUser } = useUserStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-200/20 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 backdrop-blur supports-[backdrop-filter]:bg-amber-950/95">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* ロゴ */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🏇</span>
          <span className="hidden font-serif text-xl font-bold tracking-wide text-amber-100 sm:inline-block">
            競馬チャンプ
          </span>
        </Link>

        {/* ナビゲーション（デスクトップ） */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/races" 
            className="text-amber-200/80 hover:text-amber-100 transition-colors font-medium"
          >
            レース一覧
          </Link>
          <Link 
            href="/ranking" 
            className="text-amber-200/80 hover:text-amber-100 transition-colors font-medium flex items-center gap-1"
          >
            <Trophy className="h-4 w-4" />
            ランキング
          </Link>
          {user && (
            <Link 
              href="/bets" 
              className="text-amber-200/80 hover:text-amber-100 transition-colors font-medium"
            >
              予想履歴
            </Link>
          )}
        </nav>

        {/* ユーザー情報 */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-amber-800/50" />
          ) : user ? (
            <>
              {/* コイン残高 */}
              <div className="hidden sm:flex items-center space-x-2 bg-amber-800/50 rounded-full px-4 py-1.5">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span className="font-bold text-yellow-100">
                  {storeUser?.coins?.toLocaleString() || '---'}
                </span>
              </div>

              {/* プレミアムバッジ */}
              {storeUser?.isPremium && (
                <Badge className="hidden sm:flex bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-950 font-bold">
                  Premium
                </Badge>
              )}

              {/* ユーザーメニュー */}
              <div className="relative group">
                <button className="flex items-center space-x-2 rounded-full p-1 hover:bg-amber-800/50 transition-colors">
                  <Avatar className="h-8 w-8 border-2 border-amber-400">
                    <AvatarImage src={storeUser?.avatar} />
                    <AvatarFallback className="bg-amber-700 text-amber-100">
                      {storeUser?.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {/* ドロップダウンメニュー */}
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-amber-950 border border-amber-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-amber-800">
                      <p className="font-medium text-amber-100 truncate">
                        {storeUser?.displayName || user.email?.split('@')[0]}
                      </p>
                      <div className="flex items-center text-sm text-amber-400 sm:hidden">
                        <Coins className="h-3 w-3 mr-1" />
                        {storeUser?.coins?.toLocaleString() || '---'}
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-amber-200 hover:bg-amber-800/50 transition-colors"
                    >
                      <User className="h-4 w-4 mr-2" />
                      プロフィール
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex w-full items-center px-4 py-2 text-amber-200 hover:bg-amber-800/50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      ログアウト
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" className="text-amber-200 hover:text-amber-100 hover:bg-amber-800/50">
                  ログイン
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-950 font-bold hover:from-yellow-400 hover:to-amber-400">
                  無料登録
                </Button>
              </Link>
            </div>
          )}

          {/* モバイルメニューボタン */}
          <button
            className="md:hidden p-2 text-amber-200 hover:bg-amber-800/50 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-800 bg-amber-950/95">
          <nav className="container px-4 py-4 space-y-2">
            <Link
              href="/races"
              className="block px-4 py-2 text-amber-200 hover:bg-amber-800/50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              レース一覧
            </Link>
            <Link
              href="/ranking"
              className="block px-4 py-2 text-amber-200 hover:bg-amber-800/50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              ランキング
            </Link>
            {user && (
              <Link
                href="/bets"
                className="block px-4 py-2 text-amber-200 hover:bg-amber-800/50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                予想履歴
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

