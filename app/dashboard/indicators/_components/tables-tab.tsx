'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { tablesData } from '../_data'
import type { TableInfo } from '../_data'

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

const pageSize = 10

export function TablesTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [dbFilter, setDbFilter] = useState('all')
  const [detailTable, setDetailTable] = useState<TableInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const uniqueDbs = useMemo(
    () => Array.from(new Set(tablesData.map(t => t.db))),
    []
  )

  const filtered = useMemo(() =>
    tablesData.filter(table => {
      const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDb = dbFilter === 'all' || table.db === dbFilter
      return matchesSearch && matchesDb
    }),
    [searchTerm, dbFilter]
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
    setDetailTable(null)
  }, [currentPage])

  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  )

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-3 pt-4 lg:flex-row lg:items-center lg:gap-3">
        <div className="flex min-w-0 w-full flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <Select value={dbFilter} onValueChange={setDbFilter}>
            <SelectTrigger className="h-9 w-full min-w-[9rem] shrink-0 sm:w-44">
              <SelectValue placeholder="DB" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 DB</SelectItem>
              {uniqueDbs.map(db => (
                <SelectItem key={db} value={db}>
                  {db}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="테이블명 또는 설명 검색..."
          />
        </div>
        <p className="w-full min-w-0 shrink-0 text-right text-sm text-muted-foreground lg:ml-auto lg:w-auto lg:max-w-full">
          총 {tablesData.length}개 테이블
        </p>
      </div>

      <Card className="flex min-h-0 min-w-0 flex-1 flex-col gap-0 overflow-hidden py-0">
        <CardContent className="min-h-0 min-w-0 flex-1 overflow-auto p-0">
          <Table
            containerClassName="w-full min-w-0 overflow-x-auto"
            className="min-w-[700px] border-collapse border-spacing-0 table-auto [&_th]:h-10"
          >
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4 text-xs">DB</TableHead>
                    <TableHead className="text-xs">테이블명</TableHead>
                    <TableHead className="text-xs">설명</TableHead>
                    <TableHead className="w-28 text-center text-xs">레코드 수</TableHead>
                    <TableHead className="w-24 text-center text-xs">컬럼 수</TableHead>
                    <TableHead className="w-28 text-xs">최종 수정</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody
                  className="align-top [&_td]:align-middle [&_td]:py-2.5 [&_tr]:align-top"
                  style={{ minHeight: `calc(${pageSize} * 2.5rem)` }}
                >
                  {paginated.map(table => (
                    <TableRow
                      key={table.id}
                      className="h-auto cursor-pointer hover:bg-muted/50"
                      onClick={() => setDetailTable(table)}
                    >
                      <TableCell><Badge variant="outline" className="text-xs">{table.db.split(' ')[0]}</Badge></TableCell>
                      <TableCell className="text-sm font-mono font-medium">{table.name}</TableCell>
                      <TableCell className="max-w-[14rem] break-words text-xs text-muted-foreground !whitespace-normal">
                        {table.description}
                      </TableCell>
                      <TableCell className="text-center text-xs font-medium">{table.recordCount.toLocaleString()}</TableCell>
                      <TableCell className="text-center text-xs">{table.columnCount}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{table.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailTable != null} onOpenChange={open => { if (!open) setDetailTable(null) }}>
        <DialogContent
          className="flex max-h-[92vh] min-h-0 flex-col gap-0 overflow-y-auto p-0 sm:max-w-3xl"
          showCloseButton
        >
          {detailTable && (
            <>
              <DialogHeader className="px-6 py-4 text-left">
                <div className="flex min-w-0 flex-wrap items-center gap-2 gap-y-1">
                  <DialogTitle className="font-mono text-base">{detailTable.name}</DialogTitle>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {detailTable.db}
                  </Badge>
                </div>
                <DialogDescription asChild>
                  <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto text-sm">
                    <span className="shrink-0 text-muted-foreground">{detailTable.description}</span>
                    <span className="shrink-0 text-muted-foreground/50" aria-hidden>
                      ·
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                      레코드 {detailTable.recordCount.toLocaleString()} · 컬럼 {detailTable.columnCount} · 최종 수정{' '}
                      {detailTable.lastUpdated}
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="px-6 pb-4 pt-0">
                <div className="relative w-full min-w-0 overflow-x-auto rounded-md border">
                  <Table className="min-w-[520px]">
                    <TableHeader className="!bg-transparent [&_tr]:border-b [&_tr]:border-border">
                      <TableRow>
                        <TableHead className="bg-transparent text-xs font-medium">컬럼명</TableHead>
                        <TableHead className="bg-transparent text-xs font-medium">타입</TableHead>
                        <TableHead className="w-20 bg-transparent text-center text-xs font-medium">NULL</TableHead>
                        <TableHead className="bg-transparent text-xs font-medium">설명</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailTable.columns.map((col, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-xs font-mono font-medium">{col.name}</TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs font-mono">{col.type}</Badge></TableCell>
                          <TableCell className="text-center text-xs">
                            {col.nullable
                              ? <span className="text-muted-foreground">O</span>
                              : <span className="font-medium text-foreground">X</span>
                            }
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{col.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
                key={`e-${idx}`}
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
    </div>
  )
}
