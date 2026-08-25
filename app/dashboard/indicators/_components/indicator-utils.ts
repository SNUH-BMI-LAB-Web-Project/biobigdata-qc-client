import { STAGE_LABEL } from '@/lib/api'

export const stageDbLabel = (stage: string): string =>
  STAGE_LABEL[stage] ?? stage

export const isY = (value: string | undefined | null): boolean =>
  value === 'Y' || value === 'y' || value === '1'

export const requiredVariant = (
  required: string,
): 'default' | 'secondary' | 'outline' => {
  if (required === 'R') return 'default'
  if (required === 'R2' || required === 'O') return 'secondary'
  return 'outline'
}

export const metricLevelLabel = (level: string): string =>
  ({ TABLE: '테이블', FIELD: '컬럼', CONCEPT: '컨셉' })[level?.toUpperCase()] ??
  level

export const scoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-orange-500'
  return 'text-red-600'
}

// DB(단계) 필터 옵션 — 백엔드 STAGE 코드값을 그대로 전송하고 라벨만 STAGE_LABEL 을 쓴다
export const STAGE_FILTER_OPTIONS = ['LINK', 'PREP', 'INTG', 'OPEN'].map(
  (value) => ({ value, label: stageDbLabel(value) }),
)

export const METRIC_LEVEL_FILTER_OPTIONS = ['TABLE', 'FIELD', 'CONCEPT'].map(
  (value) => ({ value, label: metricLevelLabel(value) }),
)

// 옵션을 데이터에서 도출 — 하드코딩 목록이 백엔드 값과 어긋나 필터 결과가 비는 문제 방지
export const distinctOptions = (values: (string | undefined | null)[]) =>
  Array.from(new Set(values.filter(Boolean) as string[]))
    .sort()
    .map((value) => ({ value, label: value }))
