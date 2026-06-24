'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '@/lib/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  isInitialLoading: boolean
  isRefetching: boolean
  error: string | null
}

/**
 * 데이터 조회 훅 — 마운트/deps 변경 시 fetcher 실행.
 * fetcher는 AbortSignal을 받아 언마운트 시 요청을 취소한다.
 *
 *   const { data, loading, error, refetch } = useApi(
 *     (signal) => generatedApi.GET('/api/qc/tables', { params: { query: { page } }, signal }),
 *     [page],
 *   )
 */
export function useApi<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList = [],
) {
  const depsKey = JSON.stringify(deps)
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    isInitialLoading: true,
    isRefetching: false,
    error: null,
  })

  // fetcher 최신값 유지 (deps에 fetcher를 넣지 않기 위함)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const run = useCallback((signal: AbortSignal) => {
    setState((s) => ({
      ...s,
      loading: true,
      isInitialLoading: s.data === null,
      isRefetching: s.data !== null,
      error: null,
    }))
    fetcherRef.current(signal)
      .then((data) => {
        if (!signal.aborted) {
          setState({
            data,
            loading: false,
            isInitialLoading: false,
            isRefetching: false,
            error: null,
          })
        }
      })
      .catch((err) => {
        if (signal.aborted) return
        // 세션 만료/미인증(401) → 로그인 화면으로
        if (
          err instanceof ApiError &&
          err.status === 401 &&
          typeof window !== 'undefined' &&
          window.location.pathname !== '/'
        ) {
          window.location.replace('/')
          return
        }
        const message =
          err instanceof ApiError ? err.message : '오류가 발생했습니다.'
        setState((s) => ({
          data: s.data,
          loading: false,
          isInitialLoading: false,
          isRefetching: false,
          error: message,
        }))
      })
  }, [])

  const [reloadKey, setReloadKey] = useState(0)
  const refetch = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    queueMicrotask(() => {
      if (!controller.signal.aborted) run(controller.signal)
    })
    return () => controller.abort()
  }, [run, reloadKey, depsKey])

  return { ...state, refetch }
}
