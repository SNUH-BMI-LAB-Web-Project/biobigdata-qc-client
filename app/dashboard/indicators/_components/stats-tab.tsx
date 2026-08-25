'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import { useDebounced } from '@/hooks/use-debounced'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import { RefreshingContent, TableStateRow } from '@/components/async-state'
import { TablePagerHeader } from '@/components/pager'
import { ActiveToggleCell } from './active-toggle-cell'
import { ColumnFilterHeader } from './column-filter-header'
import {
  STAGE_FILTER_OPTIONS,
  distinctOptions,
  isY,
  stageDbLabel,
} from './indicator-utils'
import type { DqStatisticsMetricResponse, PageResult } from '@/lib/api'

export function StatsTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [siMetricFilter, setSiMetricFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const keyword = useDebounced(searchTerm)

  const { data, isInitialLoading, isRefetching, error, refetch } = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<DqStatisticsMetricResponse>>(
        await generatedApi.GET('/api/qc/statistics-metrics', {
          params: {
            query: {
              keyword: keyword || undefined,
              stage: stageFilter === 'all' ? undefined : stageFilter,
              siMetric: siMetricFilter === 'all' ? undefined : siMetricFilter,
              page,
              size: pageSize,
            },
          },
          signal,
        }),
      ),
    [keyword, stageFilter, siMetricFilter, page, pageSize],
  )

  const stats = data?.items ?? []

  const onFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setPage(1)
  }

  // 유형(siMetric) 옵션은 실제 통계지표 데이터에서 도출 — 전용 엔드포인트가 없다
  const metricsApi = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<DqStatisticsMetricResponse>>(
        await generatedApi.GET('/api/qc/statistics-metrics', {
          params: { query: { page: 1, size: 500 } },
          signal,
        }),
      ),
    [],
  )
  const siMetricOptions = useMemo(
    () => distinctOptions((metricsApi.data?.items ?? []).map((stat) => stat.siMetric)),
    [metricsApi.data],
  )

  return (
    <div className="space-y-4 mt-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="통계지표명, 설명 또는 지표ID 검색..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setPage(1)
          }}
          className="pl-10"
        />
      </div>

      <Card>
        <TablePagerHeader
          page={page}
          pageSize={pageSize}
          totalCount={data?.totalCount ?? 0}
          totalPages={data?.totalPages ?? 1}
          totalLabel={`총 ${data?.totalCount ?? 0}개 통계지표 (Achilles 기반)`}
          onChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
        <CardContent className="p-0">
          <RefreshingContent isRefetching={isRefetching}>
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20 px-1 text-xs">
                    <ColumnFilterHeader
                      label="DB"
                      allLabel="전체 DB"
                      value={stageFilter}
                      onChange={onFilter(setStageFilter)}
                      options={STAGE_FILTER_OPTIONS}
                    />
                  </TableHead>
                  <TableHead className="w-44 whitespace-normal break-all text-xs">
                    {'통계지표 ID'}
                  </TableHead>
                  <TableHead className="w-44 whitespace-normal break-words text-xs">
                    {'지표명'}
                  </TableHead>
                  <TableHead className="whitespace-normal break-words text-xs">{'설명'}</TableHead>
                  <TableHead className="w-20 px-1 text-xs">
                    <ColumnFilterHeader
                      label="유형"
                      allLabel="전체 유형"
                      value={siMetricFilter}
                      onChange={onFilter(setSiMetricFilter)}
                      options={siMetricOptions}
                    />
                  </TableHead>
                  <TableHead className="w-24 whitespace-normal break-words text-xs">
                    {'비고'}
                  </TableHead>
                  <TableHead className="w-44 whitespace-normal break-words text-xs">
                    {'지표 생성일'}
                  </TableHead>
                  <TableHead className="w-28 whitespace-normal break-words text-xs">
                    {'활성/비활성'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.length === 0 ? (
                  <TableStateRow
                    colSpan={8}
                    loading={isInitialLoading}
                    error={error}
                    empty={!isInitialLoading && !error}
                    onRetry={refetch}
                  />
                ) : (
                  stats.map((stat) => (
                    <TableRow key={stat.siId} className="hover:bg-muted/50">
                      <TableCell className="text-left">
                        <Badge variant="secondary" className="text-xs">
                          {stageDbLabel(stat.siStage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono font-medium align-top whitespace-normal break-words">
                        {stat.siId}
                      </TableCell>
                      <TableCell className="text-xs font-medium align-top whitespace-normal break-words">
                        {stat.siName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground align-top whitespace-normal break-words">
                        {stat.siDescription}
                      </TableCell>
                      <TableCell className="text-left align-top">
                        <Badge variant="secondary" className="text-xs font-mono">
                          {stat.siMetric}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground align-top whitespace-normal break-words">
                        {stat.others || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground align-top whitespace-normal break-all">
                        {stat.createdAt}
                      </TableCell>
                      <TableCell className="text-left align-top">
                        <ActiveToggleCell
                          active={isY(stat.isActive)}
                          label={`통계지표 ${stat.siId}`}
                          onSave={async (next) => {
                            await unwrapGeneratedResult(
                              await generatedApi.PATCH(
                                '/api/qc/statistics-metrics/{siId}/activation',
                                {
                                  params: { path: { siId: stat.siId } },
                                  body: { isActive: next ? 'Y' : 'N' },
                                },
                              ),
                            )
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </RefreshingContent>
        </CardContent>
      </Card>
    </div>
  )
}
