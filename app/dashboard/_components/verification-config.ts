import { BarChart3, ClipboardCheck } from 'lucide-react'
import type { MetricLevel } from '@/lib/api'

export const VERIFICATION_DATABASES = [
  {
    id: 'LINK',
    name: '연계DB',
    description: '원천 데이터 연계 저장소',
    requiresSubStage: false,
  },
  {
    id: 'PREP',
    name: '전처리DB',
    description: '데이터 정제 및 전처리 저장소',
    requiresSubStage: true,
  },
  {
    id: 'INTG',
    name: '통합DB',
    description: '통합 데이터 저장소',
    requiresSubStage: true,
  },
  {
    id: 'OPEN',
    name: '개방DB',
    description: '데이터 개방 저장소',
    requiresSubStage: true,
  },
] as const

export const VERIFICATION_SUB_STAGES = [
  { id: 'preview_open', name: '사전 개방' },
  { id: 'main_open', name: '본 개방' },
] as const

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
