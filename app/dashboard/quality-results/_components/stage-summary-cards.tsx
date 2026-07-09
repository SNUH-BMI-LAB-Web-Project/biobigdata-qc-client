'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AsyncStateBlock } from '@/components/async-state'
import { useApi } from '@/hooks/use-api'
import { STAGE_LABEL, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { DqQualityResultSummaryResponse } from '@/lib/api'
import { getScoreColor } from './quality-result-utils'

// DB 카드로 노출하는 단계 (수집DB(COLL) 제외) — 통계 결과 화면과 동일하게 4개를 항상 표시한다.
const STAGE_CARDS = ['LINK', 'PREP', 'INTG', 'OPEN'] as const

interface StageSummaryCardsProps {
  selectedStage: string | null
  onSelectStage: (stage: string) => void
}

/** 단계(DB)별 품질 점수 요약 카드 — 클릭으로 검증 내역을 단계 필터링한다. */
export function StageSummaryCards({ selectedStage, onSelectStage }: StageSummaryCardsProps) {
  const summary = useApi(
    async (signal) =>
      unwrapGeneratedResult<DqQualityResultSummaryResponse[]>(
        await generatedApi.GET('/api/qc/quality-results/summary', { signal }),
      ),
    [],
  )

  const items = summary.data ?? []

  if (summary.loading || summary.error) {
    return (
      <Card>
        <CardContent className="p-0">
          <AsyncStateBlock
            loading={summary.loading}
            error={summary.error}
            empty={false}
            emptyMessage="요약 데이터가 없습니다."
            onRetry={summary.refetch}
          />
        </CardContent>
      </Card>
    )
  }

  // 요약 데이터를 단계별로 매핑 — 데이터가 없는 단계(통합/개방 등)도 카드는 항상 노출한다.
  const byStage = new Map(items.map((item) => [item.stage, item]))

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {STAGE_CARDS.map((stage) => {
        const item = byStage.get(stage)
        const isSelected = selectedStage === stage
        return (
          <button
            type="button"
            key={stage}
            className={`text-left p-2.5 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
            onClick={() => onSelectStage(stage)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{STAGE_LABEL[stage] ?? stage}</span>
              {item ? (
                <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
              ) : (
                <span className="text-lg font-bold text-muted-foreground">{'-'}</span>
              )}
            </div>
            <div className="mt-0.5">
              <span className="text-xs text-muted-foreground">
                {'지표 수 '}
                {item?.metricCount ?? 0}
                {'개'}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
