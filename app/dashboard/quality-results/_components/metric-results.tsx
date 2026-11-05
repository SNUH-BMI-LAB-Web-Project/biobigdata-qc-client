'use client'

import { useEffect, useState } from 'react'
import { Database, Download, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AsyncStateBlock,
  EmptyBlock,
  RefreshingContent,
} from '@/components/async-state'
import { CompactPager } from '@/components/pager'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/use-api'
import { API_BASE_URL, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { DqMetricResultResponse, PageResult } from '@/lib/api'
import { MetricResultCard } from './metric-result-card'

const RESULTS_PAGE_SIZE = 5

/** 선택된 검증(runId)의 지표별 결과 목록 */
export function MetricResults({ runId }: { runId: number | null }) {
  const [page, setPage] = useState(1)

  // 다른 검증을 선택하면 첫 페이지로
  useEffect(() => setPage(1), [runId])

  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<{
    runId: number
    message: string
  } | null>(null)

  // 요약(run_result_summary)이 비어 있으면 서버가 404 JSON 을 내려준다.
  const downloadReport = async () => {
    setDownloading(true)
    setDownloadError(null)
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/qc/executions/${runId}/report`,
        {
          credentials: 'include',
        },
      )
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('등록된 레포트가 없습니다.')
        }
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? '레포트 다운로드에 실패했습니다.')
      }
      const url = URL.createObjectURL(await res.blob())
      const a = document.createElement('a')
      a.href = url
      a.download = `quality_report_${runId}.doc`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setDownloadError({
        runId: runId!,
        message:
          err instanceof Error && err.message !== 'Failed to fetch'
            ? err.message
            : '레포트 다운로드 중 연결이 끊겼습니다. 다시 시도해주세요.',
      })
    } finally {
      setDownloading(false)
    }
  }

  const results = useApi(
    async (signal) =>
      runId == null
        ? null
        : unwrapGeneratedResult<PageResult<DqMetricResultResponse>>(
            await generatedApi.GET(
              '/api/qc/quality-results/checks/{runId}/metric-summary',
              {
                params: {
                  path: { runId },
                  query: { page, size: RESULTS_PAGE_SIZE },
                },
                signal,
              },
            ),
          ),
    [runId, page],
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
              {runId == null
                ? '완료된 검증을 선택하면 지표별 결과가 표시됩니다'
                : `검증 #${runId}`}
            </CardDescription>
          </div>
          {runId != null && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                disabled={downloading}
                onClick={downloadReport}
              >
                {downloading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Download />
                )}
                {'레포트 다운로드'}
              </Button>
              <CompactPager
                page={results.data?.page ?? page}
                totalPages={results.data?.totalPages ?? 1}
                onChange={setPage}
              />
            </div>
          )}
        </div>
        {downloadError?.runId === runId && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            {downloadError.message}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {runId == null ? (
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
          <RefreshingContent
            isRefetching={results.isRefetching}
            className="space-y-3"
          >
            {items.map((metric) => (
              <MetricResultCard
                key={metric.metricId}
                runId={runId}
                metric={metric}
              />
            ))}
          </RefreshingContent>
        )}
      </CardContent>
    </Card>
  )
}
