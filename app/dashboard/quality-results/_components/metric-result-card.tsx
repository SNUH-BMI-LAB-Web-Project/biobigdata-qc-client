'use client'

import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { DqQualityResultResponse } from '@/lib/api'
import { getScoreColor, isFiniteNumber } from './quality-result-utils'

function statusIcon(metric: DqQualityResultResponse) {
  if (metric.notApplicable === 1) return <XCircle className="w-4 h-4 text-red-600" />
  if (!isFiniteNumber(metric.passRate)) return <AlertCircle className="w-4 h-4 text-muted-foreground" />
  if (metric.passRate >= 90) return <CheckCircle className="w-4 h-4 text-green-600" />
  if (metric.passRate >= 80) return <AlertCircle className="w-4 h-4 text-orange-500" />
  return <XCircle className="w-4 h-4 text-red-600" />
}

/** 지표 1건의 통과율/통과·위반 건수 카드 */
export function MetricResultCard({ metric }: { metric: DqQualityResultResponse }) {
  const failed = metric.notApplicable === 1

  return (
    <div className="p-3 rounded-lg border bg-muted/20">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{metric.metricNameKor}</span>
            <Badge variant="outline" className="text-[10px]">
              {metric.category}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {metric.metricLevel}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {failed ? (
            <span className="text-xs font-bold text-red-600">{'실행 실패'}</span>
          ) : !isFiniteNumber(metric.passRate) ? (
            <span className="text-sm font-bold text-muted-foreground">{'-'}</span>
          ) : (
            <span className={`text-sm font-bold ${getScoreColor(metric.passRate)}`}>
              {Number(metric.passRate.toFixed(1))}
            </span>
          )}
          {statusIcon(metric)}
        </div>
      </div>

      {failed ? (
        <p className="text-xs text-red-600/80 mt-2">{metric.notApplicableReason || '사유 없음'}</p>
      ) : (
        <div className="mt-2 space-y-1.5">
          <Progress value={metric.passRate ?? 0} className="h-1.5" />
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="text-green-600">
              {'통과 '}
              {metric.numPassedRows.toLocaleString()}
            </span>
            <span className="text-red-600">
              {'위반 '}
              {metric.numViolatedRows.toLocaleString()}
            </span>
            <span>
              {'전체 '}
              {metric.numDenominatorRows.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
