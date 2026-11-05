'use client'

import { useApi } from '@/hooks/use-api'
import { fetchAgentStatuses, type AgentType } from '@/lib/api/agent'

/**
 * 관리자가 켜고 끄는 Agent(QC/SQL)별 사용 여부.
 * 조회 전/실패 시에는 모두 OFF 로 취급한다 (서버 기본값도 OFF).
 */
export function useAgentEnabled() {
  const { data, isInitialLoading, refetch } = useApi(() => fetchAgentStatuses())

  const statuses = data ?? []
  const isEnabled = (type: AgentType) =>
    statuses.some((s) => s.type === type && s.enabled)

  return {
    statuses,
    isEnabled,
    anyEnabled: statuses.some((s) => s.enabled),
    loading: isInitialLoading,
    refetch,
  }
}
