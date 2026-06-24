'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AsyncStateBlock } from '@/components/async-state'
import { useApi } from '@/hooks/use-api'
import { STAGE_LABEL, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { DqQualityResultSummaryResponse } from '@/lib/api'
import { getScoreColor } from './quality-result-utils'

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

  if (summary.loading || summary.error || items.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <AsyncStateBlock
            loading={summary.loading}
            error={summary.error}
            empty={items.length === 0}
            emptyMessage="요약 데이터가 없습니다."
            onRetry={summary.refetch}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {items.map((item) => {
        const isSelected = selectedStage === item.stage
        return (
          <button
            type="button"
            key={item.stage}
            className={`text-left p-2.5 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
            onClick={() => onSelectStage(item.stage)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{STAGE_LABEL[item.stage] ?? item.stage}</span>
              <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
            </div>
            <div className="mt-0.5">
              <span className="text-xs text-muted-foreground">
                {'지표 수 '}
                {item.metricCount}
                {'개'}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
