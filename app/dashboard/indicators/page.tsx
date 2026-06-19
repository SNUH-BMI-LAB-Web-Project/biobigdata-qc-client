'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Database,
  TableIcon,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { qcApi, STAGE_LABEL } from '@/lib/api'
import type {
  DqTableResponse,
  DqFieldResponse,
  DqQualityMetricResponse,
  DqStatisticsMetricResponse,
} from '@/lib/api'

// ─────────────────────────────────────────────────────────────
// 공통 헬퍼
// ─────────────────────────────────────────────────────────────

// stage → 검증 대상 DB 표시명
const stageDbLabel = (stage: string): string => STAGE_LABEL[stage] ?? stage

// "Y"/"N" 문자열 플래그 → boolean
const isY = (v: string | undefined | null): boolean => v === 'Y' || v === 'y' || v === '1'

// table_required 등급 배지 색
const requiredVariant = (req: string): 'default' | 'secondary' | 'outline' => {
  if (req === 'R') return 'default'
  if (req === 'R2' || req === 'O') return 'secondary'
  return 'outline'
}

// metricLevel(TABLE/FIELD/CONCEPT) → 한글 검증단위
const metricLevelLabel = (level: string): string =>
  ({ TABLE: '테이블', FIELD: '컬럼', CONCEPT: '컨셉' }[level?.toUpperCase()] ?? level)

// 통과율 색상: >=90 녹색 / 80~90 주황 / <80 빨강
const scoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-orange-500'
  return 'text-red-600'
}

// 입력 디바운스 — 검색어가 매 키 입력마다 API를 호출하지 않도록
function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// 공통 상태 UI
function StateRow({
  colSpan,
  loading,
  error,
  empty,
  onRetry,
}: {
  colSpan: number
  loading: boolean
  error: string | null
  empty: boolean
  onRetry: () => void
}) {
  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="py-10 text-center">
          <Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" />
        </TableCell>
      </TableRow>
    )
  }
  if (error) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="py-10 text-center">
          <p className="text-sm text-destructive mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            {'다시 시도'}
          </Button>
        </TableCell>
      </TableRow>
    )
  }
  if (empty) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="py-10 text-center text-sm text-muted-foreground">
          {'데이터가 없습니다.'}
        </TableCell>
      </TableRow>
    )
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// 테이블 목록 탭 — dq_table ⨝ dq_field (table_id 기준)
// ─────────────────────────────────────────────────────────────
function TablesTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showDisabled, setShowDisabled] = useState(false)
  const [page, setPage] = useState(1)
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null)

  const keyword = useDebounced(searchTerm)
  const size = 20

  useEffect(() => {
    setPage(1)
    setExpandedTableId(null)
  }, [keyword, showDisabled])

  const { data, loading, error, refetch } = useApi(
    (signal) =>
      qcApi.getTables(
        { keyword: keyword || undefined, includeDisabled: showDisabled, page, size },
        signal,
      ),
    [keyword, showDisabled, page],
  )

  const tables = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-4 mt-4">
      {/* 검색 / 필터 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="테이블명, 설명 또는 테이블ID 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
              <Checkbox checked={showDisabled} onCheckedChange={(v) => setShowDisabled(!!v)} />
              {'미사용 포함'}
            </label>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        {'총 '}
        {totalCount}
        {'개 테이블'}
      </p>

      {/* 테이블 목록 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 text-xs"></TableHead>
                <TableHead className="w-20 text-xs">{'DB'}</TableHead>
                <TableHead className="w-24 text-xs">{'테이블ID'}</TableHead>
                <TableHead className="text-xs">{'테이블명'}</TableHead>
                <TableHead className="w-20 text-center text-xs">{'단계'}</TableHead>
                <TableHead className="w-20 text-center text-xs">{'등급'}</TableHead>
                <TableHead className="text-xs">{'설명'}</TableHead>
                <TableHead className="w-20 text-center text-xs">{'사용'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <StateRow
                colSpan={8}
                loading={loading}
                error={error}
                empty={tables.length === 0}
                onRetry={refetch}
              />
              {!loading &&
                !error &&
                tables.map((table) => (
                  <TableRowGroup
                    key={table.tableId}
                    table={table}
                    expanded={expandedTableId === table.tableId}
                    onToggle={() =>
                      setExpandedTableId(
                        expandedTableId === table.tableId ? null : table.tableId,
                      )
                    }
                  />
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalCount > 0 && (
        <div className="flex items-center justify-end gap-3">
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
            {' 페이지'}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-7 px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-7 px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// 테이블 행 + 선택 시 하위 컬럼(dq_field) 패널
function TableRowGroup({
  table,
  expanded,
  onToggle,
}: {
  table: DqTableResponse
  expanded: boolean
  onToggle: () => void
}) {
  const enabled = isY(table.isEnable)
  return (
    <>
      <TableRow
        className={`cursor-pointer hover:bg-muted/50 ${!enabled ? 'opacity-50' : ''}`}
        onClick={onToggle}
      >
        <TableCell className="text-center">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell className="text-center">
          <Badge variant="secondary" className="text-xs">
            {stageDbLabel(table.stage)}
          </Badge>
        </TableCell>
        <TableCell className="text-xs font-mono text-muted-foreground">{table.tableId}</TableCell>
        <TableCell className="text-sm font-mono font-medium">{table.tableName}</TableCell>
        <TableCell className="text-center">
          <Badge variant="outline" className="text-xs">
            {table.stage}
          </Badge>
        </TableCell>
        <TableCell className="text-center">
          <Badge variant={requiredVariant(table.tableRequired)} className="text-xs">
            {table.tableRequired}
          </Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">{table.tableDescription}</TableCell>
        <TableCell className="text-center text-xs">
          {enabled ? (
            <span className="font-medium text-foreground">{'Y'}</span>
          ) : (
            <span className="text-muted-foreground">{'N'}</span>
          )}
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={8} className="p-0 bg-muted/20">
            <FieldsPanel tableId={table.tableId} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

// 선택된 테이블의 컬럼(dq_field) 목록 — table_id 기준 조회
function FieldsPanel({ tableId }: { tableId: string }) {
  const { data, loading, error, refetch } = useApi(
    (signal) => qcApi.getFields(tableId, { page: 1, size: 200 }, signal),
    [tableId],
  )

  const fields: DqFieldResponse[] = data?.items ?? []

  if (loading) {
    return (
      <div className="px-8 py-6 text-center">
        <Loader2 className="w-4 h-4 mx-auto animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="px-8 py-6 text-center">
        <p className="text-xs text-destructive mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          {'다시 시도'}
        </Button>
      </div>
    )
  }
  if (fields.length === 0) {
    return (
      <p className="px-8 py-4 text-xs text-muted-foreground">{'컬럼 정의(dq_field)가 없습니다.'}</p>
    )
  }

  return (
    <div className="px-8 py-3">
      <p className="text-xs font-semibold text-muted-foreground mb-2">
        {'컬럼(dq_field) '}
        {fields.length}
        {'개'}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20 text-xs">{'컬럼ID'}</TableHead>
            <TableHead className="text-xs">{'컬럼명'}</TableHead>
            <TableHead className="text-xs">{'타입'}</TableHead>
            <TableHead className="w-16 text-center text-xs">{'필수'}</TableHead>
            <TableHead className="w-12 text-center text-xs">{'PK'}</TableHead>
            <TableHead className="w-12 text-center text-xs">{'FK'}</TableHead>
            <TableHead className="text-xs">{'FK참조테이블'}</TableHead>
            <TableHead className="text-xs">{'FK참조컬럼'}</TableHead>
            <TableHead className="w-12 text-center text-xs">{'사용'}</TableHead>
            <TableHead className="text-xs">{'설명'}</TableHead>
            <TableHead className="text-xs">{'상세설명'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((col) => (
            <TableRow key={col.fieldId}>
              <TableCell className="text-xs font-mono text-muted-foreground">
                {col.fieldId}
              </TableCell>
              <TableCell className="text-xs font-mono font-medium">{col.fieldName}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs font-mono">
                  {col.datatype}
                </Badge>
              </TableCell>
              <TableCell className="text-center text-xs">{isY(col.isRequired) ? 'Y' : 'N'}</TableCell>
              <TableCell className="text-center text-xs">{isY(col.isPk) ? 'Y' : '-'}</TableCell>
              <TableCell className="text-center text-xs">{isY(col.isFk) ? 'Y' : '-'}</TableCell>
              <TableCell className="text-xs font-mono text-muted-foreground">
                {col.fkTableName || '-'}
              </TableCell>
              <TableCell className="text-xs font-mono text-muted-foreground">
                {col.fkFieldName || '-'}
              </TableCell>
              <TableCell className="text-center text-xs">{isY(col.isEnable) ? 'Y' : 'N'}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{col.fieldDescription}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {col.fieldDescriptionDetail || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 품질지표 탭 — dq_quality_metric
// ─────────────────────────────────────────────────────────────
const QUALITY_CATEGORIES = ['완전성', '정합성', '타당성']

function QualityMetricsTab() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const keyword = useDebounced(searchTerm)

  useEffect(() => {
    setPage(1)
  }, [keyword, categoryFilter, pageSize])

  const { data, loading, error, refetch } = useApi(
    (signal) =>
      qcApi.getQualityMetrics(
        {
          keyword: keyword || undefined,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          page,
          size: pageSize,
        },
        signal,
      ),
    [keyword, categoryFilter, page, pageSize],
  )

  const metrics = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1
  const startIndex = (page - 1) * pageSize

  // 표시할 stage 컬럼 — 응답의 stageScores 키 합집합 (단계별 통과율)
  const stageKeys = Array.from(
    new Set(metrics.flatMap((m) => Object.keys(m.stageScores ?? {}))),
  )

  return (
    <div className="space-y-4 mt-4">
      {/* 검색 / 필터 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="지표명, 설명 또는 지표ID 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 text-sm border rounded-md bg-background"
            >
              <option value="all">{'전체 차원'}</option>
              {QUALITY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        {'총 '}
        {totalCount}
        {'개 품질지표'}
      </p>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">{'페이지당 표시'}</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-8 px-3 py-1 text-sm border rounded-md bg-background"
              >
                <option value={5}>{'5개'}</option>
                <option value={10}>{'10개'}</option>
                <option value={20}>{'20개'}</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {totalCount === 0 ? 0 : startIndex + 1}-
                {Math.min(startIndex + pageSize, totalCount)} / {totalCount}
                {'개'}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="h-7 px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center text-xs">{'활성'}</TableHead>
                <TableHead className="w-20 text-xs">{'지표ID'}</TableHead>
                <TableHead className="w-20 text-xs">{'차원'}</TableHead>
                <TableHead className="w-20 text-xs">{'검증단위'}</TableHead>
                <TableHead className="text-xs">{'지표명'}</TableHead>
                <TableHead className="text-xs">{'대상 테이블'}</TableHead>
                {stageKeys.map((s) => (
                  <TableHead key={s} className="w-24 text-center text-xs">
                    {stageDbLabel(s)}
                  </TableHead>
                ))}
                <TableHead className="w-28 text-xs">{'지표 생성일'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <StateRow
                colSpan={7 + stageKeys.length}
                loading={loading}
                error={error}
                empty={metrics.length === 0}
                onRetry={refetch}
              />
              {!loading &&
                !error &&
                metrics.map((item: DqQualityMetricResponse) => (
                  <TableRow
                    key={item.metricId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/dashboard/indicators/${item.metricId}`)}
                  >
                    <TableCell className="text-center">
                      <Badge
                        variant={isY(item.isActive) ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {isY(item.isActive) ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-medium">{item.metricId}</TableCell>
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
                    <TableCell className="text-xs font-medium">{item.metricNameKor}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      <div
                        className="max-w-[260px] truncate"
                        title={item.tableNames?.join(', ') || ''}
                      >
                        {item.tableNames?.join(', ') || '-'}
                      </div>
                    </TableCell>
                    {stageKeys.map((s) => {
                      const score = item.stageScores?.[s]
                      return (
                        <TableCell key={s} className="text-center">
                          {score == null ? (
                            <span className="text-xs text-muted-foreground">{'-'}</span>
                          ) : (
                            <span className={`text-sm font-bold ${scoreColor(score)}`}>
                              {score}
                            </span>
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell className="text-xs text-muted-foreground">{item.createdAt}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 통계지표 탭 — dq_statistics_metric
// ─────────────────────────────────────────────────────────────
function StatsTab() {
  const [page, setPage] = useState(1)
  const size = 20

  const { data, loading, error, refetch } = useApi(
    (signal) => qcApi.getStatisticsMetrics({ page, size }, signal),
    [page],
  )

  const stats = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-4 mt-4">
      <p className="text-sm text-muted-foreground">
        {'총 '}
        {totalCount}
        {'개 통계지표 (Achilles 기반)'}
      </p>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44 text-xs">{'통계지표 ID'}</TableHead>
                <TableHead className="w-20 text-center text-xs">{'단계'}</TableHead>
                <TableHead className="text-xs">{'지표명'}</TableHead>
                <TableHead className="text-xs">{'설명'}</TableHead>
                <TableHead className="w-20 text-center text-xs">{'유형'}</TableHead>
                <TableHead className="text-xs">{'비고'}</TableHead>
                <TableHead className="w-28 text-xs">{'지표 생성일'}</TableHead>
                <TableHead className="w-20 text-center text-xs">{'상태'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <StateRow
                colSpan={8}
                loading={loading}
                error={error}
                empty={stats.length === 0}
                onRetry={refetch}
              />
              {!loading &&
                !error &&
                stats.map((stat: DqStatisticsMetricResponse) => (
                  <TableRow key={stat.siId} className="hover:bg-muted/50">
                    <TableCell className="text-xs font-mono font-medium">{stat.siId}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {stat.siStage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{stat.siName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {stat.siDescription}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs font-mono">
                        {stat.siMetric}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {stat.others || '-'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{stat.createdAt}</TableCell>
                    <TableCell className="text-center text-xs">
                      <Badge
                        variant={isY(stat.isActive) ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {isY(stat.isActive) ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalCount > 0 && (
        <div className="flex items-center justify-end gap-3">
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
            {' 페이지'}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-7 px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-7 px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 페이지
// ─────────────────────────────────────────────────────────────
export default function IndicatorsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">{'지표DB 관리'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {'원천 테이블 · 품질지표 · 통계지표 관리'}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tables">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="tables" className="gap-1.5 text-sm">
              <Database className="w-3.5 h-3.5" />
              {'테이블 목록'}
            </TabsTrigger>
            <TabsTrigger value="indicators" className="gap-1.5 text-sm">
              <TableIcon className="w-3.5 h-3.5" />
              {'품질지표'}
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1.5 text-sm">
              <BarChart3 className="w-3.5 h-3.5" />
              {'통계지표'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tables">
            <TablesTab />
          </TabsContent>

          <TabsContent value="indicators">
            <QualityMetricsTab />
          </TabsContent>

          <TabsContent value="stats">
            <StatsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
