/**
 * APIクライアント
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: object
  token?: string
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { code: 'UNKNOWN_ERROR', message: 'An error occurred' }
    }))
    throw new ApiError(
      response.status,
      error.error?.code || 'UNKNOWN_ERROR',
      error.error?.message || error.detail || 'An error occurred'
    )
  }

  return response.json()
}

// レース関連API
export const raceApi = {
  getRaces: (params?: { date?: string; venue?: string; status?: string; page?: number; limit?: number }, token?: string) => {
    const searchParams = new URLSearchParams()
    if (params?.date) searchParams.set('date', params.date)
    if (params?.venue) searchParams.set('venue', params.venue)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    return apiClient(`/races?${searchParams.toString()}`, { token })
  },

  getRace: (id: string, token?: string) =>
    apiClient(`/races/${id}`, { token }),
}

// 予想関連API
export const betApi = {
  createBet: (data: { raceId: string; betType: string; selections: number[]; amount: number }, token?: string) =>
    apiClient('/bets', { method: 'POST', body: { race_id: data.raceId, bet_type: data.betType, selections: data.selections, amount: data.amount }, token }),

  getBets: (params?: { status?: string; raceId?: string; page?: number; limit?: number }, token?: string) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.raceId) searchParams.set('race_id', params.raceId)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    return apiClient(`/bets?${searchParams.toString()}`, { token })
  },

  getBet: (id: string, token?: string) =>
    apiClient(`/bets/${id}`, { token }),
}

// コイン関連API
export const coinApi = {
  getBalance: (token?: string) =>
    apiClient('/coins/balance', { token }),

  getTransactions: (params?: { type?: string; startDate?: string; endDate?: string; page?: number; limit?: number }, token?: string) => {
    const searchParams = new URLSearchParams()
    if (params?.type) searchParams.set('type', params.type)
    if (params?.startDate) searchParams.set('start_date', params.startDate)
    if (params?.endDate) searchParams.set('end_date', params.endDate)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    return apiClient(`/coins/transactions?${searchParams.toString()}`, { token })
  },

  claimDailyBonus: (token?: string) =>
    apiClient('/coins/bonus/daily', { method: 'POST', token }),

  claimAdBonus: (token?: string) =>
    apiClient('/coins/bonus/ad', { method: 'POST', token }),
}

// ユーザー関連API
export const userApi = {
  getProfile: (token?: string) =>
    apiClient('/user/profile', { token }),

  claimRegisterBonus: (token?: string) =>
    apiClient('/user/register-bonus', { method: 'POST', token }),

  claimLoginBonus: (token?: string) =>
    apiClient('/user/login-bonus', { method: 'POST', token }),
}

// ランキング関連API
export const rankingApi = {
  getAssetsRanking: (params?: { page?: number; limit?: number }, token?: string) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    return apiClient(`/ranking/assets?${searchParams.toString()}`, { token })
  },

  getProfitRanking: (params?: { period?: string; page?: number; limit?: number }, token?: string) => {
    const searchParams = new URLSearchParams()
    if (params?.period) searchParams.set('period', params.period)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    return apiClient(`/ranking/profit?${searchParams.toString()}`, { token })
  },

  getWinRateRanking: (params?: { page?: number; limit?: number }, token?: string) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    return apiClient(`/ranking/win-rate?${searchParams.toString()}`, { token })
  },
}

