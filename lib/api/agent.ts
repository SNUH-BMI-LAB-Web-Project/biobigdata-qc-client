import { API_BASE_URL, ApiError, unwrapGeneratedResponse } from './generated/client'

export type AgentType = 'QC' | 'SQL'

export interface AgentStatus {
  type: AgentType
  label: string
  enabled: boolean
}

// ===== 공통 fetch =====

async function request<T>(
  path: string,
  init: RequestInit = {},
  envelope = false,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  const text = await res.text()
  const json = text ? JSON.parse(text) : undefined

  // CliniQ 오류({error:{code,message}}), 백엔드 envelope({success:false}) 모두 ApiError로 통일
  if (!res.ok || json?.success === false) {
    const err = json?.error ?? json
    throw new ApiError(
      err?.message || '요청 처리 중 오류가 발생했습니다.',
      res.status,
      err?.code,
    )
  }
  return envelope ? unwrapGeneratedResponse<T>(json, res.status) : (json as T)
}

export const fetchAgentStatuses = () =>
  request<AgentStatus[]>('/api/agent/status', {}, true)

// ===== QC Agent (서울대) =====

export type QcStage = 'LINK' | 'PREP' | 'INTG' | 'OPEN'
export type QcCheckType = 'quality' | 'achilles'

export type QcChart =
  | { type: 'pie'; title: string; data: { items: { category: string; fail: number; pct?: number | null }[] } }
  | { type: 'bar'; title: string; data: { labels: string[]; values: (number | null)[] } }
  | { type: 'table'; title: string; data: { rows: Record<string, unknown>[]; total?: number | null } }

export interface QcQueryResponse {
  session_id: string
  message_id: string
  mode: 'review' | 'note' | 'query'
  answer: string
  charts?: QcChart[]
}

export interface QcChatSession {
  session_id: string
  title: string
  stage: QcStage
  check_type: QcCheckType
  updated_at: string
}

export interface QcChatHistory extends QcChatSession {
  messages: { message_id: string; role: 'user' | 'assistant'; content: string; charts?: QcChart[] }[]
}

export const qcQuery = (
  body: { sessionId: string | null; question: string; stage: QcStage; checkType: QcCheckType },
  signal?: AbortSignal,
) =>
  request<QcQueryResponse>(
    '/api/agent/query',
    { method: 'POST', body: JSON.stringify(body), signal },
    true,
  )

export const qcChats = () =>
  request<{ items: QcChatSession[] }>('/api/agent/chats', {}, true)

export const qcChatMessages = (id: string) =>
  request<QcChatHistory>(`/api/agent/chats/${encodeURIComponent(id)}/messages`, {}, true)

// ===== SQL Agent (가천대 CliniQ) — 백엔드가 응답을 그대로 전달 =====

export interface SqlChoice {
  value: string
  label: string
  description?: string
}

export interface SqlRuleResult {
  success: boolean
  error_message?: string | null
  violation_count?: number | null
  denominator_count?: number | null
  violation_ratio?: number | null
  passed?: boolean | null
}

export interface SqlRule {
  rule_id: string
  name: string
  description?: string
  dq_dimension_label?: string
  severity: string
  severity_label?: string
  logic?: string
  sql?: string
  result?: SqlRuleResult | null
}

export interface SqlMessageResponse {
  session_id: string
  type: 'clarification' | 'rules' | 'duplicate' | 'failed' | 'info'
  message: string
  clarification?: { message: string; choices: SqlChoice[] } | null
  rules: SqlRule[]
  duplicates: { existing_rule_name?: string | null; reason: string }[]
  failure_reason?: string | null
}

export interface SqlChat {
  chat_id: string
  title: string
  updated_at: string
  active: boolean
}

export interface SqlChatMessage {
  seq: number
  role: 'user' | 'assistant' | 'system'
  content: string
  payload: SqlMessageResponse | null
}

export const sqlCreateSession = () =>
  request<{ session_id: string }>('/api/agent/sql/sessions', { method: 'POST' })

export const sqlResetSession = (id: string) =>
  request<void>(`/api/agent/sql/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {})

export const sqlChats = () => request<{ items: SqlChat[] }>('/api/agent/sql/chats?limit=50')

export const sqlChatMessages = (id: string) =>
  request<SqlChatMessage[]>(`/api/agent/sql/chats/${encodeURIComponent(id)}/messages`)

export const sqlDeleteChat = (id: string) =>
  request<void>(`/api/agent/sql/chats/${encodeURIComponent(id)}`, { method: 'DELETE' })

interface SqlStreamHandlers {
  onProgress: (label: string) => void
  onDone: (res: SqlMessageResponse) => void
  onError: (err: ApiError) => void
}

/** SSE 스트림. 반환된 함수로 닫는다. done/system/error 수신 시 자동 종료(재연결 방지). */
export function sqlStream(sessionId: string, message: string, h: SqlStreamHandlers): () => void {
  const es = new EventSource(
    `${API_BASE_URL}/api/agent/sql/sessions/${encodeURIComponent(sessionId)}/stream?message=${encodeURIComponent(message)}`,
    { withCredentials: true },
  )
  let finished = false
  let gotEvent = false // 이벤트 없이 끊기면 세션 만료(404)로 간주
  const finish = () => {
    finished = true
    es.close()
  }
  const parse = (e: Event) => {
    gotEvent = true
    return JSON.parse((e as MessageEvent).data)
  }
  es.addEventListener('start', () => (gotEvent = true))

  es.addEventListener('queued', () => h.onProgress('앞선 요청을 기다리는 중…'))
  es.addEventListener('stage', (e) => {
    const d = parse(e)
    if (d.status === 'running') h.onProgress(`${d.label} 중…`)
  })
  es.addEventListener('done', (e) => {
    finish()
    h.onDone(parse(e))
  })
  for (const name of ['system', 'error']) {
    es.addEventListener(name, (e) => {
      if (finished) return
      finish()
      const d = (e as MessageEvent).data ? parse(e) : {}
      h.onError(new ApiError(d.message || '에이전트 요청에 실패했습니다.', 500, d.code))
    })
  }
  // 연결 자체가 끊긴 경우(데이터 없는 error 이벤트 포함)
  es.onerror = () => {
    if (finished) return
    finish()
    h.onError(
      new ApiError('에이전트 연결이 끊겼습니다.', 500, gotEvent ? undefined : 'STREAM_UNAVAILABLE'),
    )
  }
  return finish
}
