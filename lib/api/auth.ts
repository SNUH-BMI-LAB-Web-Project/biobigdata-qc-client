// Auth API (로그인/로그아웃/현재 사용자)
import { api } from './client'
import type { LoginRequest, LoginResponse } from './types'

export const authApi = {
  /** POST /api/auth/login */
  login: (body: LoginRequest) => api.post<LoginResponse>('/api/auth/login', body),

  /** POST /api/auth/logout */
  logout: () => api.post<void>('/api/auth/logout'),

  /** GET /api/auth/me — 현재 로그인 사용자 */
  me: (signal?: AbortSignal) => api.get<LoginResponse>('/api/auth/me', undefined, signal),
}
