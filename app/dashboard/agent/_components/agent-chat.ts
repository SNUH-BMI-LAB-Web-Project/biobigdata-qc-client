import type { QcChart, SqlMessageResponse } from '@/lib/api/agent'

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  charts?: QcChart[]
  sql?: SqlMessageResponse
  error?: boolean
}

/** QC/SQL 대화 훅이 공통으로 돌려주는 모양 */
export interface AgentChat {
  messages: AgentMessage[]
  pending: boolean
  /** SQL 스트림 진행 단계 문구 */
  progress: string | null
  send: (text: string) => void
  stop: () => void
  reset: () => void
  openChat: (id: string) => Promise<void>
}

let seq = 0
export const newId = (prefix: string) => `${Date.now()}-${seq++}-${prefix}`

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : '요청 처리 중 오류가 발생했습니다.'
