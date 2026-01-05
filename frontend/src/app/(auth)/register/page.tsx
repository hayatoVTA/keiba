'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Mail, Lock, User, Loader2, Gift } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signUp, signInWithGoogle, signInWithTwitter } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signUp(email, password, displayName)
      router.push('/dashboard')
    } catch (err) {
      setError('登録に失敗しました。入力内容を確認してください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-amber-950/80 border-amber-800/50">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🏇</div>
          <CardTitle className="text-2xl font-serif text-amber-100">新規登録</CardTitle>
          <CardDescription className="text-amber-400/70">
            無料で登録して、今すぐ予想を始めよう
          </CardDescription>
          <Badge className="mt-4 bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-4 py-2">
            <Gift className="mr-2 h-4 w-4" />
            登録で10,000コインプレゼント！
          </Badge>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium text-amber-200">
                ニックネーム
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="競馬太郎"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10 bg-amber-900/50 border-amber-700 text-amber-100 placeholder:text-amber-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-amber-200">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-amber-900/50 border-amber-700 text-amber-100 placeholder:text-amber-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-amber-200">
                パスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="8文字以上"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-amber-900/50 border-amber-700 text-amber-100 placeholder:text-amber-500/50"
                  minLength={8}
                  required
                />
              </div>
              <p className="text-xs text-amber-500/70">8文字以上で設定してください</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-950 font-bold hover:from-yellow-400 hover:to-amber-400"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登録中...
                </>
              ) : (
                '無料で登録'
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-amber-950 px-2 text-amber-500">または</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full border-amber-700 text-amber-200 hover:bg-amber-800/50"
              onClick={signInWithGoogle}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Googleで登録
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-amber-700 text-amber-200 hover:bg-amber-800/50"
              onClick={signInWithTwitter}
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X (Twitter) で登録
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-amber-400/70">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-amber-300 hover:underline">
              ログイン
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-amber-500/50">
            登録することで、
            <Link href="/terms" className="hover:underline">利用規約</Link>
            および
            <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
            に同意したものとみなされます。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

