'use client'

import { useApi } from '@/hooks/use-api'
import { STAGE_LABEL, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { DqCheckLogResponse, PageResult } from '@/lib/api'

// DB 카드로 노출하는 단계 (수집DB(COLL)는 UI에 표시하지 않음 — 품질 결과와 동일)
export const STAGE_CARDS = ['LINK', 'PREP', 'INTG', 'OPEN'] as const

interface DbCountCardsProps {
  stage: string
  onSelectStage: (stage: string) => void
}

/** DB(단계)별 통계 검증 실행 건수 카드 — 통계 결과엔 요약 API가 없어 stage별 totalCount로 집계 */
export function DbCountCards({ stage, onSelectStage }: DbCountCardsProps) {
  const countsApi = useApi(
    async (signal) => {
      const entries = await Promise.all(
        STAGE_CARDS.map(async (s) => {
          const res = await unwrapGeneratedResult<PageResult<DqCheckLogResponse>>(
            await generatedApi.GET('/api/qc/statistics-results/checks', {
              params: { query: { stage: s, page: 1, size: 1 } },
              signal,
            }),
          )
          return [s, res.totalCount] as const
        }),
      )
      return Object.fromEntries(entries) as Record<string, number>
    },
    [],
  )
  const counts = countsApi.data ?? {}

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {STAGE_CARDS.map((s) => {
        const isSelected = stage === s
        const count = counts[s] ?? 0
        return (
          <button
            type="button"
            key={s}
            className={`text-left p-2.5 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
            onClick={() => onSelectStage(s)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{STAGE_LABEL[s] ?? s}</span>
              <span className="text-lg font-bold">{countsApi.loading ? '-' : count}</span>
            </div>
            <div className="mt-0.5">
              <span className="text-xs text-muted-foreground">{'검증 실행 건수'}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
