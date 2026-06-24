'use client'

import { useEffect, useState } from 'react'
import { Database } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AsyncStateBlock, EmptyBlock, RefreshingContent } from '@/components/async-state'
import { CompactPager } from '@/components/pager'
import { useApi } from '@/hooks/use-api'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { DqQualityResultResponse, PageResult } from '@/lib/api'
import { MetricResultCard } from './metric-result-card'

const RESULTS_PAGE_SIZE = 5

/** 선택된 검증(checkId)의 지표별 결과 목록 */
export function MetricResults({ checkId }: { checkId: number | null }) {
  const [page, setPage] = useState(1)

  // 다른 검증을 선택하면 첫 페이지로
  useEffect(() => setPage(1), [checkId])

  const results = useApi(
    async (signal) =>
      checkId == null
        ? null
        : unwrapGeneratedResult<PageResult<DqQualityResultResponse>>(
            await generatedApi.GET('/api/qc/quality-results/checks/{checkId}/metrics', {
              params: { path: { checkId }, query: { page, size: RESULTS_PAGE_SIZE } },
              signal,
            }),
          ),
    [checkId, page],
  )

  const items = results.data?.items ?? []

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4" />
              {'지표별 결과'}
            </CardTitle>
            <CardDescription className="text-xs">
              {checkId == null ? '완료된 검증을 선택하면 지표별 결과가 표시됩니다' : `검증 #${checkId}`}
            </CardDescription>
          </div>
          {checkId != null && (
            <CompactPager
              page={results.data?.page ?? page}
              totalPages={results.data?.totalPages ?? 1}
              onChange={setPage}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {checkId == null ? (
          <EmptyBlock message="위 표에서 완료된 검증을 선택하세요." />
        ) : items.length === 0 ? (
          <AsyncStateBlock
            loading={results.isInitialLoading}
            error={results.error}
            empty={!results.isInitialLoading && !results.error}
            emptyMessage="해당 검증의 지표 결과가 없습니다."
            onRetry={results.refetch}
          />
        ) : (
          <RefreshingContent isRefetching={results.isRefetching} className="space-y-3">
            {items.map((metric) => (
              <MetricResultCard key={metric.metricId} metric={metric} />
            ))}
          </RefreshingContent>
        )}
      </CardContent>
    </Card>
  )
}
