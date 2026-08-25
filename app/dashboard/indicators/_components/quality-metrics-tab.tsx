'use client'

import { memo, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  METRIC_LEVEL_FILTER_OPTIONS,
  STAGE_FILTER_OPTIONS,
  distinctOptions,
  isY,
  metricLevelLabel,
  stageDbLabel,
} from './indicator-utils'
import type { DqQualityMetricResponse, PageResult } from '@/lib/api'

export function QualityMetricsTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [metricLevelFilter, setMetricLevelFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const keyword = useDebounced(searchTerm)

  const { data, isInitialLoading, isRefetching, error, refetch } = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<DqQualityMetricResponse>>(
        await generatedApi.GET('/api/qc/quality-metrics', {
          params: {
            query: {
              keyword: keyword || undefined,
              category: categoryFilter === 'all' ? undefined : categoryFilter,
              stage: stageFilter === 'all' ? undefined : stageFilter,
              metricLevel:
                metricLevelFilter === 'all' ? undefined : metricLevelFilter,
              page,
              size: pageSize,
            },
          },
          signal,
        }),
      ),
    [keyword, categoryFilter, stageFilter, metricLevelFilter, page, pageSize],
  )

  const metrics = useMemo(() => data?.items ?? [], [data?.items])

  const onFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setPage(1)
  }

  // 차원(카테고리) 옵션은 실제 지표 데이터에서 도출 — 하드코딩 목록이 백엔드 값과 어긋나 필터 결과가 비는 문제 방지
  const categoriesApi = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<DqQualityMetricResponse>>(
        await generatedApi.GET('/api/qc/quality-metrics', {
          params: { query: { page: 1, size: 500 } },
          signal,
        }),
      ),
    [],
  )
  const categoryOptions = useMemo(
    () => distinctOptions((categoriesApi.data?.items ?? []).map((m) => m.category)),
    [categoriesApi.data],
  )

  return (
    <div className="space-y-4 mt-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="지표명, 설명 또는 지표ID 검색..."
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
          totalLabel={`총 ${data?.totalCount ?? 0}개 품질지표`}
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
                  <TableHead className="w-24 truncate whitespace-nowrap text-xs">
                    {'지표ID'}
                  </TableHead>
                  <TableHead className="w-20 px-1 text-xs">
                    <ColumnFilterHeader
                      label="차원"
                      allLabel="전체 차원"
                      value={categoryFilter}
                      onChange={onFilter(setCategoryFilter)}
                      options={categoryOptions}
                    />
                  </TableHead>
                  <TableHead className="w-24 px-1 text-xs">
                    <ColumnFilterHeader
                      label="검증단위"
                      allLabel="전체 단위"
                      value={metricLevelFilter}
                      onChange={onFilter(setMetricLevelFilter)}
                      options={METRIC_LEVEL_FILTER_OPTIONS}
                    />
                  </TableHead>
                  <TableHead className="w-[220px] truncate whitespace-nowrap text-xs">
                    {'지표명'}
                  </TableHead>
                  <TableHead className="truncate whitespace-nowrap text-xs">
                    {'대상 테이블'}
                  </TableHead>
                  <TableHead className="w-36 truncate whitespace-nowrap text-xs">
                    {'지표 생성일'}
                  </TableHead>
                  <TableHead className="w-32 truncate whitespace-nowrap text-xs">
                    {'활성/비활성'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.length === 0 ? (
                  <TableStateRow
                    colSpan={8}
                    loading={isInitialLoading}
                    error={error}
                    empty={!isInitialLoading && !error}
                    onRetry={refetch}
                  />
                ) : (
                  metrics.map((item) => <QualityMetricRow key={item.metricId} item={item} />)
                )}
              </TableBody>
            </Table>
          </RefreshingContent>
        </CardContent>
      </Card>
    </div>
  )
}

const QualityMetricRow = memo(function QualityMetricRow({
  item,
}: {
  item: DqQualityMetricResponse
}) {
  const router = useRouter()
  const tableNames = useMemo(() => item.tableNames?.join(', ') || '-', [item.tableNames])

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => router.push(`/dashboard/indicators/${item.metricId}`)}
    >
      <TableCell className="text-left">
        <Badge variant="secondary" className="text-xs">
          {stageDbLabel(item.stage)}
        </Badge>
      </TableCell>
      <TableCell
        className="truncate whitespace-nowrap text-xs font-mono font-medium align-top"
        title={item.metricId}
      >
        {item.metricId}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {item.category}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs">
          {metricLevelLabel(item.metricLevel)}
        </Badge>
      </TableCell>
      <TableCell
        className="truncate whitespace-nowrap text-xs font-medium align-top"
        title={item.metricNameKor}
      >
        {item.metricNameKor}
      </TableCell>
      <TableCell className="text-xs font-mono text-muted-foreground align-top">
        <div className="truncate whitespace-nowrap" title={tableNames}>
          {tableNames}
        </div>
      </TableCell>
      <TableCell
        className="truncate whitespace-nowrap text-xs text-muted-foreground"
        title={item.createdAt}
      >
        {item.createdAt}
      </TableCell>
      <TableCell className="text-left">
        <ActiveToggleCell
          active={isY(item.isActive)}
          label={`품질지표 ${item.metricId}`}
          onSave={async (next) => {
            await unwrapGeneratedResult(
              await generatedApi.PATCH('/api/qc/quality-metrics/{metricId}/activation', {
                params: { path: { metricId: item.metricId } },
                body: { isActive: next ? 'Y' : 'N' },
              }),
            )
          }}
        />
      </TableCell>
    </TableRow>
  )
})
