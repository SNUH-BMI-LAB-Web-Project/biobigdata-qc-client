import { ClipboardCheck, FileSearch, TrendingDown, Wand2 } from 'lucide-react'
import type { ComponentType } from 'react'

export interface QuickQuestion {
  id: string
  icon: ComponentType<{ className?: string }>
  /** 카드에 노출되는 짧은 제목 */
  title: string
  /** 카드 부제 — 어떤 답을 받게 되는지 한 줄 설명 */
  description: string
  /** 클릭 시 입력창에 채워지는 실제 질문 문장 */
  prompt: string
}

/** 에이전트 시작 화면에 노출되는 4개의 빠른 질문 */
export const QUICK_QUESTIONS: readonly QuickQuestion[] = [
  {
    id: 'latest-summary',
    icon: ClipboardCheck,
    title: '최근 검증 결과 요약',
    description: '마지막 품질검증 실행의 핵심 지표를 정리합니다',
    prompt: '가장 최근 품질검증 실행 결과를 요약해줘.',
  },
  {
    id: 'failed-metrics',
    icon: TrendingDown,
    title: '기준 미달 지표 찾기',
    description: '임계값을 넘지 못한 품질지표를 추려냅니다',
    prompt: '이번 검증에서 기준 점수에 미달한 품질지표를 알려줘.',
  },
  {
    id: 'stage-compare',
    icon: FileSearch,
    title: '단계별 품질 비교',
    description: '연계DB부터 개방DB까지 단계별 점수를 비교합니다',
    prompt: '연계DB, 전처리DB, 통합DB, 개방DB의 품질 점수를 비교해줘.',
  },
  {
    id: 'improvement',
    icon: Wand2,
    title: '개선 방안 제안',
    description: '결측·이상치가 많은 필드의 조치 방안을 제안합니다',
    prompt: '결측률이 높은 필드에 대한 개선 방안을 제안해줘.',
  },
]

/** 대화 중 입력창 위에 노출되는 후속 질문 칩 */
export const FOLLOW_UP_SUGGESTIONS: readonly string[] = [
  '해당 지표의 계산식을 알려줘',
  '이전 검증 회차와 비교해줘',
  '영향받는 테이블 목록을 보여줘',
]

export interface AgentScope {
  id: string
  name: string
}

/** 질문 범위를 좁히는 대상 DB — 검증 실행 화면의 단계 구분과 동일하다 */
export const AGENT_SCOPES: readonly AgentScope[] = [
  { id: 'ALL', name: '전체' },
  { id: 'LINK', name: '연계DB' },
  { id: 'PREP', name: '전처리DB' },
  { id: 'INTG', name: '통합DB' },
  { id: 'OPEN', name: '개방DB' },
]
