'use client'

import { useState } from 'react'
import { AsyncStateBlock, RefreshingContent } from '@/components/async-state'
import { CompactPager } from '@/components/pager'
import { useApi } from '@/hooks/use-api'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { DqSubMetricResultResponse, PageResult } from '@/lib/api'
import { getScoreColor, isFiniteNumber } from './quality-result-utils'

const SUB_METRICS_PAGE_SIZE = 5

/** METRIC_ID 하위 세부지표(검증 대상 열) 드릴다운 목록 */
export function SubMetricResults({
  checkId,
  metricId,
}: {
  checkId: number
  metricId: string
}) {
  const [page, setPage] = useState(1)

  const results = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<DqSubMetricResultResponse>>(
        await generatedApi.GET(
          '/api/qc/quality-results/checks/{checkId}/metrics/{metricId}/sub-metrics',
          {
            params: {
              path: { checkId, metricId },
              query: { page, size: SUB_METRICS_PAGE_SIZE },
            },
            signal,
          },
        ),
      ),
    [checkId, metricId, page],
  )

  const items = results.data?.items ?? []

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <AsyncStateBlock
          loading={results.isInitialLoading}
          error={results.error}
          empty={!results.isInitialLoading && !results.error}
          emptyMessage="세부지표 결과가 없습니다."
          onRetry={results.refetch}
        />
      ) : (
        <RefreshingContent isRefetching={results.isRefetching}>
          <ul className="space-y-1.5">
            {items.map((sub) => {
              const failed = sub.notApplicable === 1
              return (
                <li
                  key={sub.subMetricId}
                  className="flex items-center justify-between gap-2 rounded-md bg-background px-2.5 py-1.5 text-xs"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {sub.subMetricName}
                    </div>
                    {sub.checkTargetColumn && (
                      <div className="truncate text-muted-foreground">
                        {sub.checkTargetColumn}
                      </div>
                    )}
                    {failed && (
                      <div className="text-red-600/80">
                        {sub.notApplicableReason || '사유 없음'}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {failed ? (
                      <span className="font-bold text-red-600">
                        {'실행 실패'}
                      </span>
                    ) : !isFiniteNumber(sub.passRate) ? (
                      <span className="font-bold text-muted-foreground">
                        {'-'}
                      </span>
                    ) : (
                      <span
                        className={`font-bold ${getScoreColor(sub.passRate)}`}
                      >
                        {Number(sub.passRate.toFixed(1))}
                      </span>
                    )}
                    {!failed && (
                      <div className="text-muted-foreground">
                        {sub.numPassedRows?.toLocaleString() ?? '-'}
                        {' / '}
                        {sub.numDenominatorRows?.toLocaleString() ?? '-'}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </RefreshingContent>
      )}
      <div className="flex justify-end">
        <CompactPager
          page={results.data?.page ?? page}
          totalPages={results.data?.totalPages ?? 1}
          onChange={setPage}
        />
      </div>
    </div>
  )
}
