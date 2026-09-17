'use client'

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
import { getScoreColor, isFiniteNumber } from './quality-result-utils'

const SUB_METRICS_PAGE_SIZE = 5
const COLUMN_COUNT = 13

/** METRIC_ID 하위 세부지표(검증 대상 열) 드릴다운 목록 */
export function SubMetricResults({
  runId,
  metricId,
}: {
  runId: number
  metricId: string
}) {
  const [page, setPage] = useState(1)

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
                <TableHead className="w-28 truncate whitespace-nowrap text-xs">
                  {'체크타입ID'}
                </TableHead>
                <TableHead className="w-28 truncate whitespace-nowrap text-xs">
                  {'체크ID'}
                </TableHead>
                <TableHead className="w-40 truncate whitespace-nowrap text-xs">
                  {'세부지표명'}
                </TableHead>
                <TableHead className="w-32 truncate whitespace-nowrap text-xs">
                  {'검증 대상 열'}
                </TableHead>
                <TableHead className="w-64 text-xs">{'설명'}</TableHead>
                <TableHead className="w-24 truncate whitespace-nowrap text-xs">
                  {'필드체크ID'}
                </TableHead>
                <TableHead className="w-24 truncate whitespace-nowrap text-xs">
                  {'테이블체크ID'}
                </TableHead>
                <TableHead className="w-28 truncate whitespace-nowrap text-xs">
                  {'표준용어체크ID'}
                </TableHead>
                <TableHead className="w-24 truncate whitespace-nowrap text-xs">
                  {'실패사유'}
                </TableHead>
                <TableHead className="w-20 text-right text-xs">
                  {'대상행수'}
                </TableHead>
                <TableHead className="w-20 text-right text-xs">
                  {'통과/위배행수'}
                </TableHead>
                <TableHead className="w-16 text-right text-xs">
                  {'위배율(%)'}
                </TableHead>
                <TableHead className="w-16 text-right text-xs">
                  {'통과율(%)'}
                </TableHead>
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
                        title={sub.checkTypeId}
                      >
                        {sub.checkTypeId ?? '-'}
                      </TableCell>
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
                      <TableCell
                        className="truncate whitespace-nowrap text-xs text-muted-foreground"
                        title={sub.checkNotes}
                      >
                        {sub.checkNotes ?? '-'}
                      </TableCell>
                      <TableCell
                        className="truncate whitespace-nowrap text-xs font-mono text-muted-foreground"
                        title={sub.fieldCheckId}
                      >
                        {sub.fieldCheckId ?? '-'}
                      </TableCell>
                      <TableCell
                        className="truncate whitespace-nowrap text-xs font-mono text-muted-foreground"
                        title={sub.tableCheckId}
                      >
                        {sub.tableCheckId ?? '-'}
                      </TableCell>
                      <TableCell
                        className="truncate whitespace-nowrap text-xs font-mono text-muted-foreground"
                        title={sub.conceptCheckId}
                      >
                        {sub.conceptCheckId ?? '-'}
                      </TableCell>
                      <TableCell
                        className="truncate whitespace-nowrap text-xs text-red-600/80"
                        title={sub.notApplicableReason}
                      >
                        {failed ? sub.notApplicableReason || '사유 없음' : '-'}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {sub.numDenominatorRows?.toLocaleString() ?? '-'}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {sub.numPassedRows?.toLocaleString() ?? '-'}
                        {' / '}
                        {sub.numViolatedRows?.toLocaleString() ?? '-'}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {isFiniteNumber(sub.pctViolatedRows)
                          ? sub.pctViolatedRows.toFixed(1)
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right text-xs">
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
    </div>
  )
}
