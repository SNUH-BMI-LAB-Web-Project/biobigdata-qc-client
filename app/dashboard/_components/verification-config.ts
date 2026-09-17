import { BarChart3, ClipboardCheck } from 'lucide-react'
import type { MetricLevel } from '@/lib/api'

export const VERIFICATION_INDICATOR_TYPES = [
  { id: 'quality', name: '품질지표', icon: ClipboardCheck },
  { id: 'stats', name: '통계지표', icon: BarChart3 },
] as const

/** 검증 범위 모달의 세분화 단위 — 항상 하나가 선택되며 전환 시 선택이 초기화된다. */
export const VERIFICATION_METRIC_LEVELS = [
  { id: 'TABLE', description: '테이블 단위 검증' },
  { id: 'FIELD', description: '필드(컬럼) 단위 검증' },
  { id: 'CONCEPT', description: '개념(코드/의미) 단위 검증' },
] as const satisfies readonly { id: MetricLevel; description: string }[]

export const EXECUTIONS_PAGE_SIZE = 5
