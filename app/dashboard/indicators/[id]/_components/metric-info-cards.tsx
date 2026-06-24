import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { STAGE_LABEL } from '@/lib/api'
import type { DqQualityMetricDetailResponse } from '@/lib/api'
import { getScoreColor, isFiniteNumber } from './detail-utils'

/** 지표 정보 + 단계별 통과율 (좌우 2개 카드) */
export function MetricInfoCards({ detail }: { detail: DqQualityMetricDetailResponse }) {
  const stageEntries = Object.entries(detail.stageScores ?? {})

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">지표 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">카테고리:</span>
            <Badge variant="outline">{detail.category}</Badge>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground shrink-0">설명:</span>
            <span className="text-right">{detail.metricDescription}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">단계별 검증 통과율</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {stageEntries.length === 0 && <p className="text-muted-foreground">검증 결과가 없습니다.</p>}
          {stageEntries.map(([stage, score]) => (
            <div key={stage} className="flex justify-between">
              <span className="text-muted-foreground">{STAGE_LABEL[stage] ?? stage}:</span>
              <span
                className={`font-bold ${isFiniteNumber(score) ? getScoreColor(score) : 'text-muted-foreground'}`}
              >
                {isFiniteNumber(score) ? score.toFixed(1) : '-'}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
