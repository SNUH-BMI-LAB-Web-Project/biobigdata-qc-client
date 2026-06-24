'use client'

import { memo, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { useApi } from '@/hooks/use-api'
import { useDebounced } from '@/hooks/use-debounced'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import { RefreshingContent, TableStateRow } from '@/components/async-state'
import { TablePagerHeader } from '@/components/pager'
import { isY, metricLevelLabel, QUALITY_CATEGORIES, scoreColor, stageDbLabel } from './indicator-utils'
import type { DqQualityMetricResponse, PageResult } from '@/lib/api'

export function QualityMetricsTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
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
              page,
              size: pageSize,
            },
          },
          signal,
        }),
      ),
    [keyword, categoryFilter, page, pageSize],
  )

  const metrics = useMemo(() => data?.items ?? [], [data?.items])
  const stageKeys = useMemo(
    () => Array.from(new Set(metrics.flatMap((metric) => Object.keys(metric.stageScores ?? {})))),
    [metrics],
  )

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
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
        <Select
          value={categoryFilter}
          onValueChange={(value) => {
            setCategoryFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-[140px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{'전체 차원'}</SelectItem>
            {QUALITY_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                  <TableHead className="w-24 truncate whitespace-nowrap text-xs">{'지표ID'}</TableHead>
                  <TableHead className="w-20 truncate whitespace-nowrap text-xs">{'차원'}</TableHead>
                  <TableHead className="w-24 truncate whitespace-nowrap text-xs">{'검증단위'}</TableHead>
                  <TableHead className="w-[220px] truncate whitespace-nowrap text-xs">{'지표명'}</TableHead>
                  <TableHead className="truncate whitespace-nowrap text-xs">{'대상 테이블'}</TableHead>
                  {stageKeys.map((stage) => (
                    <TableHead key={stage} className="w-24 text-xs">
                      {stageDbLabel(stage)}
                    </TableHead>
                  ))}
                  <TableHead className="w-36 truncate whitespace-nowrap text-xs">{'지표 생성일'}</TableHead>
                  <TableHead className="w-32 truncate whitespace-nowrap text-xs">{'활성/비활성'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.length === 0 ? (
                  <TableStateRow
                    colSpan={7 + stageKeys.length}
                    loading={isInitialLoading}
                    error={error}
                    empty={!isInitialLoading && !error}
                    onRetry={refetch}
                  />
                ) : (
                  metrics.map((item) => (
                    <QualityMetricRow key={item.metricId} item={item} stageKeys={stageKeys} />
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

const QualityMetricRow = memo(function QualityMetricRow({
  item,
  stageKeys,
}: {
  item: DqQualityMetricResponse
  stageKeys: string[]
}) {
  const router = useRouter()
  const tableNames = useMemo(() => item.tableNames?.join(', ') || '-', [item.tableNames])

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => router.push(`/dashboard/indicators/${item.metricId}`)}
    >
      <TableCell className="truncate whitespace-nowrap text-xs font-mono font-medium align-top" title={item.metricId}>
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
      <TableCell className="truncate whitespace-nowrap text-xs font-medium align-top" title={item.metricNameKor}>
        {item.metricNameKor}
      </TableCell>
      <TableCell className="text-xs font-mono text-muted-foreground align-top">
        <div className="truncate whitespace-nowrap" title={tableNames}>
          {tableNames}
        </div>
      </TableCell>
      {stageKeys.map((stage) => {
        const score = item.stageScores?.[stage]
        return (
          <TableCell key={stage} className="text-left">
            {score == null ? (
              <span className="text-xs text-muted-foreground">{'-'}</span>
            ) : (
              <span className={`text-sm font-bold ${scoreColor(score)}`}>{score}</span>
            )}
          </TableCell>
        )
      })}
      <TableCell className="truncate whitespace-nowrap text-xs text-muted-foreground" title={item.createdAt}>
        {item.createdAt}
      </TableCell>
      <TableCell className="text-left">
        <ActiveStatusCell active={isY(item.isActive)} />
      </TableCell>
    </TableRow>
  )
})

function ActiveStatusCell({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-start gap-2">
      <Checkbox checked={active} disabled />
      <span className={`text-xs ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
        {active ? '활성' : '비활성'}
      </span>
    </div>
  )
}
