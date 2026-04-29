'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { IndicatorDetailDialog } from './indicator-detail-dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SearchInput } from '@/components/search-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { indicatorsData, CATEGORIES } from '../_data'
import type { Indicator } from '../_data'

/** 1 … 4 5 6 … 10 형태로 페이지 번호 목록 생성 */
function getPaginationItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 0) return []
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const items: (number | 'ellipsis')[] = []
  const push = (p: number | 'ellipsis') => {
    if (items[items.length - 1] === p && p === 'ellipsis') return
    items.push(p)
  }
  push(1)
  if (current <= 3) {
    for (let p = 2; p <= 4; p++) push(p)
    push('ellipsis')
    push(total)
  } else if (current >= total - 2) {
    push('ellipsis')
    for (let p = total - 3; p <= total; p++) push(p)
  } else {
    push('ellipsis')
    for (let p = current - 1; p <= current + 1; p++) push(p)
    push('ellipsis')
    push(total)
  }
  return items
}

export function IndicatorsTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 4
  const [indicators, setIndicators] = useState<Indicator[]>(indicatorsData)
  const [detailId, setDetailId] = useState<number | null>(null)

  const detailIndicator = useMemo(
    () => (detailId != null ? indicators.find(i => i.id === detailId) ?? null : null),
    [detailId, indicators]
  )

  const activeCount = useMemo(
    () => indicators.reduce((n, i) => n + (i.isActive ? 1 : 0), 0),
    [indicators]
  )

  const handleDetailOpenChange = useCallback((open: boolean) => {
    if (!open) setDetailId(null)
  }, [])

  const handleToggleActive = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setIndicators(prev => prev.map(item =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    ))
  }, [])

  const filtered = useMemo(() =>
    indicators.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      return matchesSearch && matchesCategory
    }),
    [indicators, searchTerm, categoryFilter]
  )

  const totalPages = Math.ceil(filtered.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginated = filtered.slice(startIndex, startIndex + pageSize)

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  useEffect(() => {
    setDetailId(null)
  }, [currentPage])

  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  )

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-3 pt-4 lg:flex-row lg:items-center lg:gap-3">
        <div className="flex min-w-0 w-full flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-full min-w-[9rem] shrink-0 sm:w-44">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 카테고리</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="지표명 또는 설명 검색..."
          />
        </div>
        <p className="w-full min-w-0 shrink-0 text-right text-sm text-muted-foreground lg:ml-auto lg:w-auto lg:max-w-full">
          총 {indicators.length}개 품질지표 (활성: {activeCount}개)
        </p>
      </div>

      <Card className="flex min-h-0 min-w-0 flex-1 flex-col gap-0 overflow-hidden py-0">
        <CardContent className="min-h-0 min-w-0 flex-1 overflow-auto p-0">
          <Table
            containerClassName="w-full min-w-0 overflow-x-auto"
            className="min-w-[740px] border-collapse border-spacing-0 table-auto"
          >
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 px-0 text-center text-xs">적용</TableHead>
                <TableHead className="w-16 text-xs">ID</TableHead>
                <TableHead className="w-24 text-xs">카테고리</TableHead>
                <TableHead className="text-xs">지표명</TableHead>
                <TableHead className="text-xs">설명</TableHead>
                <TableHead className="w-20 text-center text-xs">가중치</TableHead>
                <TableHead className="w-20 text-center text-xs">기준값</TableHead>
                <TableHead className="w-28 text-xs">수정일</TableHead>
                <TableHead className="w-28 text-xs">적용일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_td]:align-middle [&_td]:py-2.5 [&_tr]:align-top">
              {paginated.map(item => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setDetailId(item.id)}
                >
                  <TableCell
                    className="px-0 py-2.5 text-center"
                    onClick={(e) => handleToggleActive(item.id, e)}
                  >
                    <div className="flex justify-center">
                      <Checkbox checked={item.isActive} />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{item.id}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{item.category}</Badge></TableCell>
                  <TableCell className="min-w-[6rem] max-w-[min(16rem,40vw)] break-words text-xs font-medium !whitespace-normal">
                    {item.name}
                  </TableCell>
                  <TableCell className="min-w-[8rem] max-w-[min(20rem,50vw)] break-words text-xs text-muted-foreground !whitespace-normal">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-center text-xs">{item.weight}</TableCell>
                  <TableCell className="text-center text-xs font-medium">{item.threshold}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.lastModified}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.appliedDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {totalPages > 0 && (
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-1 bg-background py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 border-0 bg-transparent text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {paginationItems.map((item, idx) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${currentPage}-${idx}`}
                className="flex h-8 min-w-8 items-center justify-center px-1 text-sm text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 shrink-0 border-0 bg-transparent shadow-none hover:text-foreground',
                  currentPage === item
                    ? 'font-semibold text-foreground hover:bg-muted/50'
                    : 'text-muted-foreground hover:bg-muted/50'
                )}
                onClick={() => setCurrentPage(item)}
                aria-label={`${item}페이지`}
                aria-current={currentPage === item ? 'page' : undefined}
              >
                {item}
              </Button>
            )
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 border-0 bg-transparent text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <IndicatorDetailDialog
        indicator={detailIndicator}
        indicators={indicators}
        open={detailId != null}
        onOpenChange={handleDetailOpenChange}
        onNavigate={setDetailId}
      />
    </div>
  )
}
