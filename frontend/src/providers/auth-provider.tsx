'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/user-store'
import { userApi } from '@/lib/api'

interface AuthContextType {
  user: SupabaseUser | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithTwitter: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { setUser: setStoreUser, logout } = useUserStore()
  const supabase = createClient()

  useEffect(() => {
    // 初期セッションの取得
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // ユーザー情報を取得
        try {
          const token = session.access_token
          const profile = await userApi.getProfile(token) as { user: Record<string, unknown> }
          setStoreUser({
            id: session.user.id,
            email: session.user.email,
            displayName: profile.user.display_name as string || session.user.email?.split('@')[0],
            avatar: profile.user.avatar as string,
            coins: (profile.user.coins as number) || 10000,
            totalBets: (profile.user.total_bets as number) || 0,
            totalWins: (profile.user.total_wins as number) || 0,
            winRate: (profile.user.win_rate as number) || 0,
            rank: profile.user.rank as number | undefined,
            isPremium: (profile.user.is_premium as boolean) || false,
            consecutiveLoginDays: (profile.user.consecutive_login_days as number) || 0,
          })
        } catch {
          // プロフィール取得失敗時は新規ユーザーとして登録ボーナスを試行
          try {
            const token = session.access_token
            await userApi.claimRegisterBonus(token)
          } catch {
            // 既に登録済みの場合は無視
          }
        }
      }
      
      setIsLoading(false)
    }

    getSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (!session) {
          logout()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, setStoreUser, logout])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    logout()
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  const signInWithTwitter = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithTwitter,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

