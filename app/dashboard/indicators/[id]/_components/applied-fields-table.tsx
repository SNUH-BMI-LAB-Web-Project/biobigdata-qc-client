'use client'

import { useMemo, useState } from 'react'
import { ArrowUpDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CompactPager } from '@/components/pager'
import { useApi } from '@/hooks/use-api'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { FieldCheckItem, PageResult } from '@/lib/api'
import { isActiveFlag } from './detail-utils'

const PAGE_SIZE = 20

/** 지표가 적용되는 테이블/컬럼 목록 — 필터·정렬·페이징 (자체 조회) */
export function AppliedFieldsTable({ metricId }: { metricId: string }) {
  const [tableFilter, setTableFilter] = useState('')
  const [columnFilter, setColumnFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // all | active | inactive
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<keyof FieldCheckItem | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const onFilter = (setter: (v: string) => void) => (v: string) => {
    setter(v)
    setPage(1)
  }

  const isActiveParam =
    activeFilter === 'active' ? '1' : activeFilter === 'inactive' ? '0' : undefined

  const { data, loading, error, refetch } = useApi(
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

  // 현재 페이지 항목만 클라이언트 정렬
  const rows = useMemo(() => {
    const items = data?.items ?? []
    if (!sortField) return items
    return [...items].sort((a, b) => {
      const cmp = (a[sortField] ?? '').toString().localeCompare((b[sortField] ?? '').toString())
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [data, sortField, sortDirection])

  return (
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
                    onChange={(e) => onFilter(setActiveFilter)(e.target.value)}
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
                    onChange={(e) => onFilter(setTableFilter)(e.target.value)}
                    className="h-7 px-2 text-xs"
                  />
                </TableHead>
                <TableHead className="text-xs">
                  <Input
                    placeholder="컬럼 검색..."
                    value={columnFilter}
                    onChange={(e) => onFilter(setColumnFilter)(e.target.value)}
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
                <SortHead label="DB명" onClick={() => handleSort('dbName')} />
                <SortHead label="테이블명" onClick={() => handleSort('tableName')} />
                <SortHead label="컬럼명" onClick={() => handleSort('fieldName')} />
                <SortHead label="생성일" onClick={() => handleSort('createdAt')} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    <div className="flex flex-col items-center gap-3">
                      <span>{error}</span>
                      <Button variant="outline" size="sm" onClick={refetch}>
                        다시 시도
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                !error &&
                rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center">
                      <Checkbox checked={isActiveFlag(row.isActive)} disabled />
                    </TableCell>
                    <TableCell className="text-xs">{row.dbName || '-'}</TableCell>
                    <TableCell className="text-xs font-medium">{row.tableName}</TableCell>
                    <TableCell className="text-xs">
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{row.fieldName}</code>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.createdAt}</TableCell>
                  </TableRow>
                ))}
              {!loading && !error && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    필터 조건에 맞는 데이터가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs">
            <span className="text-muted-foreground">
              총 {data.totalCount}건 · {data.page}/{data.totalPages} 페이지
            </span>
            <div className={loading ? 'pointer-events-none opacity-60' : undefined}>
              <CompactPager page={page} totalPages={data.totalPages} onChange={setPage} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SortHead({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <TableHead className="text-xs">
      <Button variant="ghost" size="sm" onClick={onClick} className="h-7 px-2 gap-1 hover:bg-transparent">
        {label}
        <ArrowUpDown className="w-3 h-3" />
      </Button>
    </TableHead>
  )
}
