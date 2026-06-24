import createClient from 'openapi-fetch'

import type { paths } from './schema'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

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

export const generatedApi = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: 'include',
})

interface ApiEnvelope<T> {
  success?: boolean
  code?: string
  message?: string
  data?: T
}

export function unwrapGeneratedResponse<T>(
  payload: ApiEnvelope<T> | undefined,
  status = 200,
): T {
  if (!payload) {
    return undefined as T
  }

  if (payload.success === false) {
    throw new ApiError(payload.message || '요청이 실패했습니다.', status, payload.code)
  }

  return payload.data as T
}

export async function unwrapGeneratedResult<T>(
  result: {
    data?: unknown
    error?: ApiEnvelope<unknown> | unknown
    response: Response
  },
): Promise<T> {
  if (result.error) {
    const message =
      typeof result.error === 'object' &&
      result.error &&
      'message' in result.error &&
      result.error.message
        ? String(result.error.message)
        : '요청 처리 중 오류가 발생했습니다.'
    const code =
      typeof result.error === 'object' &&
      result.error &&
      'code' in result.error &&
      result.error.code
        ? String(result.error.code)
        : undefined

    throw new ApiError(message, result.response.status, code)
  }

  return unwrapGeneratedResponse(result.data as ApiEnvelope<T> | undefined, result.response.status)
}

export type { paths, components, operations } from './schema'
