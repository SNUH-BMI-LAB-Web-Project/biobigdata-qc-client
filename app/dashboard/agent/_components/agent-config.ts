import type { AgentType } from '@/lib/api/agent'

export interface AgentUiConfig {
  title: string
  heading: string
  description: string
  placeholder: string
}

export const AGENT_CONFIG: Record<AgentType, AgentUiConfig> = {
  QC: {
    title: '품질 검증 Agent',
    heading: '무엇이 궁금하신가요?',
    description: 'DB별 품질 점수, 검증 실행 내역, 지표별 결과 등\n데이터 품질 검증에 대해 물어보세요.',
    placeholder: '데이터 검증 결과에 대해 물어보세요',
  },
  SQL: {
    title: '품질 지표 Agent',
    heading: '어떤 품질지표를 만들까요?',
    description: '검사하고 싶은 테이블·컬럼과 조건을 말씀해 주세요.\n품질 규칙(SQL)을 만들어 실행까지 해 드립니다.',
    placeholder: '만들고 싶은 품질지표를 설명해 주세요',
  },
}

export interface AgentScope {
  id: string
  name: string
}

/** QC Agent 대상 DB 단계 — API가 LINK/PREP/INTG/OPEN 만 받는다 */
export const QC_STAGES: readonly AgentScope[] = [
  { id: 'LINK', name: '수집DB' },
  { id: 'PREP', name: '정제DB' },
  { id: 'INTG', name: '통합DB' },
  { id: 'OPEN', name: '개방DB' },
]

export const QC_CHECK_TYPES: readonly AgentScope[] = [
  { id: 'quality', name: '품질지표' },
  { id: 'achilles', name: '통계지표' },
]
