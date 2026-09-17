'use client'

import { useMemo, useState } from 'react'
import { BarChart3, ListOrdered } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useApi } from '@/hooks/use-api'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import { AsyncStateBlock, RefreshingContent } from '@/components/async-state'
import { CompactPager } from '@/components/pager'
import { DistributionResults } from './distribution-results'
import { fmtNum, stratumKey } from './statistics-format'
import type {
  DqStatisticsResultDistResponse,
  DqStatisticsResultResponse,
} from '@/lib/api'

const PAGE_SIZE = 20

export function StatisticsResults({ runId }: { runId: number }) {
  const countApi = useApi(
    async (signal) =>
      unwrapGeneratedResult<DqStatisticsResultResponse[]>(
        await generatedApi.GET(
          '/api/qc/statistics-results/checks/{runId}/analyses',
          {
            params: { path: { runId }, query: { metricId: undefined } },
            signal,
          },
        ),
      ),
    [runId],
  )
  const distApi = useApi(
    async (signal) =>
      unwrapGeneratedResult<DqStatisticsResultDistResponse[]>(
        await generatedApi.GET(
          '/api/qc/statistics-results/checks/{runId}/analyses/dist',
          {
            params: { path: { runId }, query: { metricId: undefined } },
            signal,
          },
        ),
      ),
    [runId],
  )

  const [countPageState, setCountPageState] = useState({ runId, page: 1 })
  const countPage = countPageState.runId === runId ? countPageState.page : 1
  const setCountPage = (page: number) => setCountPageState({ runId, page })
  const countData = useMemo(() => countApi.data ?? [], [countApi.data])
  const countTotalPages = useMemo(
    () => Math.max(1, Math.ceil(countData.length / PAGE_SIZE)),
    [countData.length],
  )
  const pagedCount = useMemo(
    () => countData.slice((countPage - 1) * PAGE_SIZE, countPage * PAGE_SIZE),
    [countData, countPage],
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ListOrdered className="w-4 h-4" />
                {'통계 결과 — 단순값'}
              </CardTitle>
              <CardDescription className="text-xs">
                {`검증 #${runId} · count 값 (distribution=0)`}
              </CardDescription>
            </div>
            <CompactPager
              page={countPage}
              totalPages={countTotalPages}
              onChange={setCountPage}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {(countApi.data?.length ?? 0) === 0 ? (
            <AsyncStateBlock
              loading={countApi.isInitialLoading}
              error={countApi.error}
              empty={!countApi.isInitialLoading && !countApi.error}
              emptyMessage="단순값 통계 결과가 없습니다."
              onRetry={countApi.refetch}
            />
          ) : (
            <RefreshingContent isRefetching={countApi.isRefetching}>
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-2 font-medium">{'지표 ID'}</th>
                    <th className="text-left p-2 font-medium">
                      {'분류 (Stratum)'}
                    </th>
                    <th className="text-right p-2 font-medium">{'Count'}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedCount.map((row, index) => (
                    <tr
                      key={`${row.metricId}-${index}`}
                      className="border-b hover:bg-muted/30"
                    >
                      <td className="p-2 font-mono">{row.metricId}</td>
                      <td className="p-2">{stratumKey(row)}</td>
                      <td className="p-2 text-right font-mono">
                        {fmtNum(row.countValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </RefreshingContent>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {'통계 결과 — 분포'}
          </CardTitle>
          <CardDescription className="text-xs">
            {`검증 #${runId} · 분포 값 (distribution=1)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(distApi.data?.length ?? 0) === 0 ? (
            <AsyncStateBlock
              loading={distApi.isInitialLoading}
              error={distApi.error}
              empty={!distApi.isInitialLoading && !distApi.error}
              emptyMessage="분포 통계 결과가 없습니다."
              onRetry={distApi.refetch}
            />
          ) : (
            <RefreshingContent isRefetching={distApi.isRefetching}>
              <DistributionResults
                rows={distApi.data ?? []}
                fmtNum={fmtNum}
                stratumKey={stratumKey}
              />
            </RefreshingContent>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
