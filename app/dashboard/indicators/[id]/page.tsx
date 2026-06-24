'use client'

import { useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, ArrowUpDown, Loader2 } from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { STAGE_LABEL, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import { CompactPager } from '../../_components/pager'
import type {
  DqQualityMetricDetailResponse,
  FieldCheckItem,
  PageResult,
} from '@/lib/api'

const PAGE_SIZE = 20

// isActive는 백엔드에서 문자열로 내려옴 — 활성 여부 판정
const isActiveFlag = (value: string) => {
  const v = (value ?? '').toString().trim().toLowerCase()
  return v === '1' || v === 'y' || v === 'true' || v === 'active' || v === '활성'
}

// 점수 색상: >=90 green, 80~90 orange, <80 red
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-orange-600'
  return 'text-red-600'
}

export default function IndicatorDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const metricId = id

  // ── 필터 / 페이지 상태 ──────────────────────────────────────
  const [tableFilter, setTableFilter] = useState<string>('')
  const [columnFilter, setColumnFilter] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<string>('all') // all | active | inactive
  const [page, setPage] = useState<number>(1)

  const [sortField, setSortField] = useState<keyof FieldCheckItem | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // 검색어/필터 변경 시 디바운스용 — 입력값을 그대로 쿼리에 전달하되 페이지는 1로 초기화
  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v)
    setPage(1)
  }

  // ── 지표 상세 ───────────────────────────────────────────────
  const {
    data: detail,
    loading: detailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useApi(
    async (signal) =>
      unwrapGeneratedResult<DqQualityMetricDetailResponse>(
        await generatedApi.GET('/api/qc/quality-metrics/{metricId}', {
          params: { path: { metricId } },
          signal,
        }),
      ),
    [metricId],
  )

  // ── 적용 대상 컬럼 ──────────────────────────────────────────
  const isActiveParam =
    activeFilter === 'active' ? '1' : activeFilter === 'inactive' ? '0' : undefined

  const {
    data: checksPage,
    loading: checksLoading,
    error: checksError,
    refetch: refetchChecks,
  } = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<FieldCheckItem>>(
        await generatedApi.GET('/api/qc/quality-metrics/{metricId}/checks', {
          params: {
            path: { metricId },
            query: {
              page,
              size: PAGE_SIZE,
              isActive: isActiveParam,
              tableName: tableFilter || undefined,
              fieldName: columnFilter || undefined,
            },
          },
          signal,
        }),
      ),
    [metricId, page, isActiveParam, tableFilter, columnFilter],
  )

  const handleSort = (field: keyof FieldCheckItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // 현재 페이지 항목에 대해서만 클라이언트 정렬
  const sortedChecks = useMemo(() => {
    const items = checksPage?.items ?? []
    if (!sortField) return items
    return [...items].sort((a, b) => {
      const aVal = (a[sortField] ?? '').toString()
      const bVal = (b[sortField] ?? '').toString()
      const comparison = aVal.localeCompare(bVal)
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [checksPage, sortField, sortDirection])

  const stageScores = detail?.stageScores ?? {}
  const stageEntries = Object.entries(stageScores)

  // ── 상세 로딩/에러/빈 상태 ──────────────────────────────────
  if (detailLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (detailError || !detail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-sm text-muted-foreground">
          {detailError ?? '지표 정보를 불러오지 못했습니다.'}
        </p>
        <Button variant="outline" size="sm" onClick={refetchDetail}>
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          지표 목록으로 돌아가기
        </Button>

        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">
                  <span className="font-mono text-base text-muted-foreground mr-2">{detail.metricId}</span>
                  {detail.metricNameKor}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <Badge variant="outline">{detail.category}</Badge>
                  <Badge variant="secondary">{detail.metricLevel}</Badge>
                  <Badge variant={isActiveFlag(detail.isActive) ? 'default' : 'secondary'}>
                    {isActiveFlag(detail.isActive) ? '활성' : '비활성'}
                  </Badge>
                  <span>지표 생성일: {detail.createdAt}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">지표 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">카테고리:</span>
                <Badge variant="outline">{detail.category}</Badge>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">설명:</span>
                <span className="text-right">{detail.metricDescription}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">단계별 검증 통과율</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {stageEntries.length === 0 && (
                <p className="text-muted-foreground">검증 결과가 없습니다.</p>
              )}
              {stageEntries.map(([stage, score]) => (
                <div key={stage} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {STAGE_LABEL[stage] ?? stage}:
                  </span>
                  <span className={`font-bold ${isFiniteNumber(score) ? getScoreColor(score) : 'text-muted-foreground'}`}>
                    {isFiniteNumber(score) ? score.toFixed(1) : '-'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Applied Tables / Columns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">적용 대상 테이블 및 컬럼</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs w-16">
                      <select
                        value={activeFilter}
                        onChange={(e) => handleFilterChange(setActiveFilter)(e.target.value)}
                        className="h-7 px-1 text-xs border rounded bg-background w-full"
                      >
                        <option value="all">전체</option>
                        <option value="active">적용</option>
                        <option value="inactive">미적용</option>
                      </select>
                    </TableHead>
                    <TableHead className="text-xs">
                      <span className="text-muted-foreground">DB명</span>
                    </TableHead>
                    <TableHead className="text-xs">
                      <Input
                        placeholder="테이블 검색..."
                        value={tableFilter}
                        onChange={(e) => handleFilterChange(setTableFilter)(e.target.value)}
                        className="h-7 px-2 text-xs"
                      />
                    </TableHead>
                    <TableHead className="text-xs">
                      <Input
                        placeholder="컬럼 검색..."
                        value={columnFilter}
                        onChange={(e) => handleFilterChange(setColumnFilter)(e.target.value)}
                        className="h-7 px-2 text-xs"
                      />
                    </TableHead>
                    <TableHead className="text-xs">
                      <span className="text-muted-foreground">생성일</span>
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-xs w-16">
                      <span>적용</span>
                    </TableHead>
                    <TableHead className="text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('dbName')}
                        className="h-7 px-2 gap-1 hover:bg-transparent"
                      >
                        DB명
                        <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('tableName')}
                        className="h-7 px-2 gap-1 hover:bg-transparent"
                      >
                        테이블명
                        <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('fieldName')}
                        className="h-7 px-2 gap-1 hover:bg-transparent"
                      >
                        컬럼명
                        <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('createdAt')}
                        className="h-7 px-2 gap-1 hover:bg-transparent"
                      >
                        생성일
                        <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checksLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                      </TableCell>
                    </TableRow>
                  )}
                  {!checksLoading && checksError && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                        <div className="flex flex-col items-center gap-3">
                          <span>{checksError}</span>
                          <Button variant="outline" size="sm" onClick={refetchChecks}>
                            다시 시도
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!checksLoading && !checksError && sortedChecks.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">
                        <Checkbox checked={isActiveFlag(row.isActive)} disabled />
                      </TableCell>
                      <TableCell className="text-xs">{row.dbName || '-'}</TableCell>
                      <TableCell className="text-xs font-medium">{row.tableName}</TableCell>
                      <TableCell className="text-xs">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          {row.fieldName}
                        </code>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.createdAt}</TableCell>
                    </TableRow>
                  ))}
                  {!checksLoading && !checksError && sortedChecks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                        필터 조건에 맞는 데이터가 없습니다
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {checksPage && checksPage.totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3 text-xs">
                <span className="text-muted-foreground">
                  총 {checksPage.totalCount}건 · {checksPage.page}/{checksPage.totalPages} 페이지
                </span>
                <div className={checksLoading ? 'pointer-events-none opacity-60' : undefined}>
                  <CompactPager page={page} totalPages={checksPage.totalPages} onChange={setPage} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
