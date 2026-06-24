import { STAGE_LABEL } from '@/lib/api'

export const QUALITY_CATEGORIES = ['완전성', '정합성', '타당성']

export const stageDbLabel = (stage: string): string => STAGE_LABEL[stage] ?? stage

export const isY = (value: string | undefined | null): boolean =>
  value === 'Y' || value === 'y' || value === '1'

export const requiredVariant = (required: string): 'default' | 'secondary' | 'outline' => {
  if (required === 'R') return 'default'
  if (required === 'R2' || required === 'O') return 'secondary'
  return 'outline'
}

export const metricLevelLabel = (level: string): string =>
  ({ TABLE: '테이블', FIELD: '컬럼', CONCEPT: '컨셉' }[level?.toUpperCase()] ?? level)

export const scoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-orange-500'
  return 'text-red-600'
}
