// QC Server API 공통 fetch 클라이언트
// - Swagger: http://175.106.96.71:8081
// - 모든 응답은 ApiResponse<T> 봉투({ success, code, message, data })로 감싸여 옴
// - 세션(쿠키) 기반 인증이므로 credentials: 'include' 사용

// 기본은 상대경로('') — 브라우저는 같은 출처 /api/* 를 호출하고,
// Next 서버(next.config rewrites)가 BACKEND_URL 로 프록시한다. (CORS/쿠키 문제 회피)
// NEXT_PUBLIC_API_BASE_URL 을 지정하면 프록시를 우회해 브라우저가 직접 호출(레거시).
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

/** 백엔드 공통 응답 봉투 */
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
}

/** 페이지네이션 응답 */
export interface PageResult<T> {
  items: T[]
  totalCount: number
  page: number
  size: number
  totalPages: number
}

/** API 에러 — message/code/status 보존 */
export class ApiError extends Error {
  code?: string
  status: number
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type Query = Record<string, string | number | boolean | undefined | null>

function buildUrl(path: string, query?: Query): string {
  // 상대경로('/api/...')도 지원해야 하므로 URL 생성자를 쓰지 않고 직접 조립
  let url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  if (query) {
    const qs = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        qs.set(key, String(value))
      }
    }
    const s = qs.toString()
    if (s) url += (url.includes('?') ? '&' : '?') + s
  }
  return url
}

interface RequestOptions {
  query?: Query
  body?: unknown
  signal?: AbortSignal
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, body, signal } = options

  const res = await fetch(buildUrl(path, query), {
    method,
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  // 본문 파싱 (비어있을 수 있음)
  let payload: ApiResponse<T> | null = null
  const text = await res.text()
  if (text) {
    try {
      payload = JSON.parse(text) as ApiResponse<T>
    } catch {
      // JSON이 아니면 그대로 에러 메시지로 사용
      if (!res.ok) throw new ApiError(text || res.statusText, res.status)
    }
  }

  if (!res.ok) {
    throw new ApiError(
      payload?.message || res.statusText || '요청 처리 중 오류가 발생했습니다.',
      res.status,
      payload?.code,
    )
  }

  if (payload && payload.success === false) {
    throw new ApiError(payload.message || '요청이 실패했습니다.', res.status, payload.code)
  }

  // ApiResponse 봉투면 data만 반환, 아니면 원문 반환
  return (payload ? payload.data : (undefined as unknown)) as T
}

export const api = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) =>
    request<T>('GET', path, { query, signal }),
  post: <T>(path: string, body?: unknown, query?: Query) =>
    request<T>('POST', path, { body, query }),
  put: <T>(path: string, body?: unknown, query?: Query) =>
    request<T>('PUT', path, { body, query }),
  delete: <T>(path: string, query?: Query) => request<T>('DELETE', path, { query }),
}
