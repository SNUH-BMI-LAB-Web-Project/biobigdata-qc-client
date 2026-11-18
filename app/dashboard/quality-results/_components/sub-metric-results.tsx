'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Eye, X } from 'lucide-react'
import { useState } from 'react'
import { RefreshingContent, TableStateRow } from '@/components/async-state'
import { CompactPager } from '@/components/pager'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { DqSubMetricResultResponse, PageResult } from '@/lib/api'
import { ViolationDetailDialog } from './violation-detail-dialog'

const SUB_METRICS_PAGE_SIZE = 5
const COLUMN_COUNT = 6

/** METRIC_ID 하위 세부지표(검증 대상 열) 드릴다운 목록 */
export function SubMetricResults({
  runId,
  metricId,
}: {
  runId: number
  metricId: string
}) {
  const [page, setPage] = useState(1)
  const [detailSub, setDetailSub] = useState<DqSubMetricResultResponse | null>(
    null,
  )

  const [errorSub, setErrorSub] = useState<DqSubMetricResultResponse | null>(
    null,
  )

  const results = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<DqSubMetricResultResponse>>(
        await generatedApi.GET(
          '/api/qc/quality-results/checks/{runId}/metrics/{metricId}/sub-metrics',
          {
            params: {
              path: { runId, metricId },
              query: { page, size: SUB_METRICS_PAGE_SIZE },
            },
            signal,
          },
        ),
      ),
    [runId, metricId, page],
  )

  const items = results.data?.items ?? []

  return (
    <div className="space-y-2">
      <RefreshingContent isRefetching={results.isRefetching}>
        <div className="overflow-x-auto rounded-md bg-background">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-32 text-xs">{'세부지표 ID'}</TableHead>
                <TableHead className="w-48 text-xs">{'세부지표명'}</TableHead>
                <TableHead className="w-40 text-xs">{'검증 대상 열'}</TableHead>
                <TableHead className="w-24 text-right text-xs">{'통과'}</TableHead>
                <TableHead className="w-24 text-right text-xs">{'위반'}</TableHead>
                <TableHead className="w-24 text-right text-xs">{'전체'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableStateRow
                  colSpan={COLUMN_COUNT}
                  loading={results.isInitialLoading}
                  error={results.error}
                  empty={!results.isInitialLoading && !results.error}
                  emptyMessage="세부지표 결과가 없습니다."
                  onRetry={results.refetch}
                />
              ) : (
                items.map((sub) => {
                  const failed = sub.notApplicable === 1
                  return (
                    <TableRow key={sub.subMetricId}>
                      <TableCell
                        className="truncate whitespace-nowrap text-xs font-mono"
                        title={sub.subMetricId}
                      >
                        {sub.subMetricId ?? '-'}
                      </TableCell>
                      <TableCell
                        className="truncate whitespace-nowrap text-xs font-medium"
                        title={sub.subMetricName}
                      >
                        {sub.subMetricName ?? '-'}
                      </TableCell>
                      <TableCell
                        className="truncate whitespace-nowrap text-xs text-muted-foreground"
                        title={sub.checkTargetColumn}
                      >
                        {sub.checkTargetColumn ?? '-'}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {sub.numPassedRows?.toLocaleString() ?? '-'}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {failed ? (
                          <button
                            type="button"
                            className="font-bold text-red-600 underline underline-offset-2 hover:text-red-700"
                            onClick={() => setErrorSub(sub)}
                          >
                            {'실행 실패'}
                          </button>
                        ) : (sub.numViolatedRows ?? 0) > 0 ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-red-600 underline underline-offset-2 hover:text-red-700"
                            onClick={() => setDetailSub(sub)}
                          >
                            <Eye className="size-3" />
                            {sub.numViolatedRows?.toLocaleString()}
                          </button>
                        ) : (
                          (sub.numViolatedRows?.toLocaleString() ?? '-')
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {sub.numDenominatorRows?.toLocaleString() ?? '-'}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </RefreshingContent>
      <div className="flex justify-end">
        <CompactPager
          page={results.data?.page ?? page}
          totalPages={results.data?.totalPages ?? 1}
          onChange={setPage}
        />
      </div>
      <DialogPrimitive.Root
        open={!!errorSub}
        onOpenChange={(open) => !open && setErrorSub(null)}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <DialogPrimitive.Content className="bg-background fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-lg border p-6 shadow-lg sm:max-w-2xl">
            <DialogPrimitive.Title className="text-sm font-semibold">
              {`실행 오류 로그 - ${errorSub?.subMetricId ?? ''}`}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {'세부지표 실행 실패 사유'}
            </DialogPrimitive.Description>
            <pre className="overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 font-mono text-xs">
              {errorSub?.notApplicableReason || '기록된 오류 로그가 없습니다.'}
            </pre>
            <DialogPrimitive.Close className="absolute top-4 right-4">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      {detailSub && (
        <ViolationDetailDialog
          runId={runId}
          metricId={metricId}
          sub={detailSub}
          onClose={() => setDetailSub(null)}
        />
      )}
    </div>
  )
}
