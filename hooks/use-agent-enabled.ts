'use client'

import { useApi } from '@/hooks/use-api'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'

/**
 * 관리자가 켜고 끄는 Agent 사용 여부.
 * 조회 전/실패 시에는 enabled=false 로 취급한다 (서버 기본값도 OFF).
 */
export function useAgentEnabled() {
  const { data, isInitialLoading } = useApi(
    async (signal) =>
      unwrapGeneratedResult<boolean>(
        await generatedApi.GET('/api/agent/status', { signal }),
      ),
  )

  return { enabled: data === true, loading: isInitialLoading }
}
