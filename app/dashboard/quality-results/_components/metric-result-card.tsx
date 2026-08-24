'use client'

import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DqMetricResultResponse } from '@/lib/api'
import { getScoreColor, isFiniteNumber } from './quality-result-utils'
import { SubMetricResults } from './sub-metric-results'

function statusIcon(metric: DqMetricResultResponse, failed: boolean) {
  if (failed) return <XCircle className="w-4 h-4 text-red-600" />
  if (!isFiniteNumber(metric.passRate))
    return <AlertCircle className="w-4 h-4 text-muted-foreground" />
  if (metric.passRate >= 90)
    return <CheckCircle className="w-4 h-4 text-green-600" />
  if (metric.passRate >= 80)
    return <AlertCircle className="w-4 h-4 text-orange-500" />
  return <XCircle className="w-4 h-4 text-red-600" />
}

/** 지표(METRIC_ID) 1건의 통과율/통과·위반 건수를 통합해 보여주는 카드. 세부지표가 있으면 펼쳐서 드릴다운 가능 */
export function MetricResultCard({
  checkId,
  metric,
}: {
  checkId: number
  metric: DqMetricResultResponse
}) {
  const [expanded, setExpanded] = useState(false)
  const hasSubMetrics = (metric.subMetricCount ?? 0) > 0
  const failed =
    hasSubMetrics && metric.notApplicableCount === metric.subMetricCount
  const partialFailure = !failed && (metric.notApplicableCount ?? 0) > 0

  return (
    <div className="rounded-lg border bg-muted/20">
      <div
        className={`p-3 ${hasSubMetrics ? 'cursor-pointer' : ''}`}
        onClick={() => hasSubMetrics && setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {hasSubMetrics &&
                (expanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                ))}
              <span className="text-sm font-medium">
                {metric.metricNameKor}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {metric.category}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {metric.metricLevel}
              </Badge>
              {hasSubMetrics && (
                <Badge variant="outline" className="text-[10px]">
                  {'세부지표 '}
                  {metric.subMetricCount}
                </Badge>
              )}
              {partialFailure && (
                <Badge variant="destructive" className="text-[10px]">
                  {'실행 실패 '}
                  {metric.notApplicableCount}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {failed ? (
              <span className="text-xs font-bold text-red-600">
                {'실행 실패'}
              </span>
            ) : !isFiniteNumber(metric.passRate) ? (
              <span className="text-sm font-bold text-muted-foreground">
                {'-'}
              </span>
            ) : (
              <span
                className={`text-sm font-bold ${getScoreColor(metric.passRate)}`}
              >
                {Number(metric.passRate.toFixed(1))}
              </span>
            )}
            {statusIcon(metric, failed)}
          </div>
        </div>

        {!failed && (
          <div className="mt-2 space-y-1.5">
            <div className="bg-primary/20 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(0, Math.min(100, metric.passRate ?? 0))}%`,
                }}
              />
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="text-green-600">
                {'통과 '}
                {metric.numPassedRows?.toLocaleString() ?? '-'}
              </span>
              <span className="text-red-600">
                {'위반 '}
                {metric.numViolatedRows?.toLocaleString() ?? '-'}
              </span>
              <span>
                {'전체 '}
                {metric.numDenominatorRows?.toLocaleString() ?? '-'}
              </span>
            </div>
          </div>
        )}
      </div>

      {expanded && hasSubMetrics && (
        <div className="border-t px-3 pb-3 pt-2">
          <SubMetricResults checkId={checkId} metricId={metric.metricId} />
        </div>
      )}
    </div>
  )
}
