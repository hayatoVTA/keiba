import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email?: string
  displayName?: string
  avatar?: string
  coins: number
  totalBets: number
  totalWins: number
  winRate: number
  rank?: number
  isPremium: boolean
  consecutiveLoginDays: number
}

interface UserState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  updateCoins: (coins: number) => void
  updateStats: (stats: Partial<User>) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false
      }),

      updateCoins: (coins) => set((state) => ({
        user: state.user ? { ...state.user, coins } : null
      })),

      updateStats: (stats) => set((state) => ({
        user: state.user ? { ...state.user, ...stats } : null
      })),

      logout: () => set({
        user: null,
        isAuthenticated: false
      }),
    }),
    {
      name: 'keiba-user-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)

