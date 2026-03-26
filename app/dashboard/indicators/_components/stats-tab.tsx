'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

const statsRows = [
  { id: 1, name: '일별 환자 수', desc: '일자별 신규 및 재진 환자 수', period: '매일', lastRun: '2024-01-15', status: '정상' },
  { id: 2, name: '진료과별 방문 현황', desc: '진료과별 일일 방문 환자 수', period: '매일', lastRun: '2024-01-15', status: '정상' },
  { id: 3, name: '월별 진단 분포', desc: '주요 진단 코드별 월간 분포', period: '매월', lastRun: '2024-01-01', status: '정상' },
  { id: 4, name: '검사 항목별 통계', desc: '검사 종류별 수행 건수 및 이상치', period: '매주', lastRun: '2024-01-14', status: '경고' },
  { id: 5, name: '임상시험 등록 현황', desc: '시험별 참여자 등록 추이', period: '매일', lastRun: '2024-01-15', status: '정상' },
  { id: 6, name: '이상반응 발생률', desc: '임상시험별 이상반응 발생 통계', period: '매주', lastRun: '2024-01-14', status: '정상' },
  { id: 7, name: '약물 처방 현황', desc: '의약품 처방 빈도 및 용량 분포', period: '매일', lastRun: '2024-01-15', status: '정상' },
  { id: 8, name: '입퇴원 통계', desc: '일별 입원/퇴원 환자 수', period: '매일', lastRun: '2024-01-15', status: '정상' },
] as const

const STATS_STATUSES = [...new Set(statsRows.map(s => s.status))].sort((a, b) =>
  a.localeCompare(b, 'ko')
)

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

export function StatsTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    let rows = statsRows.filter(stat =>
      statusFilter === 'all' || stat.status === statusFilter
    )
    const q = searchTerm.trim().toLowerCase()
    if (!q) return [...rows]
    return rows.filter(stat =>
      String(stat.id).includes(q) ||
      stat.name.toLowerCase().includes(q) ||
      stat.desc.toLowerCase().includes(q) ||
      stat.period.toLowerCase().includes(q) ||
      stat.lastRun.toLowerCase().includes(q) ||
      stat.status.toLowerCase().includes(q)
    )
  }, [searchTerm, statusFilter])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginated = filtered.slice(startIndex, startIndex + pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  )

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
      <div className="flex min-w-0 shrink-0 flex-col gap-3 pt-4 lg:flex-row lg:items-center lg:gap-3">
        <div className="flex min-w-0 w-full flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-full min-w-[9rem] shrink-0 sm:w-44">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              {STATS_STATUSES.map(s => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="통계 지표명, 설명, 산출 주기 검색..."
          />
        </div>
        <p className="w-full min-w-0 shrink-0 text-right text-sm text-muted-foreground lg:ml-auto lg:w-auto lg:max-w-full">
          총 {statsRows.length}개 통계 지표
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
                <TableHead className="w-16 text-center text-xs">ID</TableHead>
                <TableHead className="text-xs">통계 지표명</TableHead>
                <TableHead className="text-xs">설명</TableHead>
                <TableHead className="w-28 text-xs">산출 주기</TableHead>
                <TableHead className="w-28 text-center text-xs">마지막 산출</TableHead>
                <TableHead className="w-24 text-center text-xs">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody
              className="align-top [&_td]:align-middle [&_td]:py-2.5 [&_tr]:align-top"
              style={{ minHeight: `calc(${pageSize} * 2.5rem)` }}
            >
              {paginated.map(stat => (
                <TableRow key={stat.id} className="hover:bg-muted/50">
                  <TableCell className="text-center text-xs font-medium">{stat.id}</TableCell>
                  <TableCell className="min-w-[6rem] max-w-[min(16rem,40vw)] break-words text-xs font-medium !whitespace-normal">
                    {stat.name}
                  </TableCell>
                  <TableCell className="max-w-[14rem] break-words text-xs text-muted-foreground !whitespace-normal">
                    {stat.desc}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-xs">{stat.period}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">{stat.lastRun}</TableCell>
                  <TableCell className="text-center text-xs">
                    <Badge variant={stat.status === '정상' ? 'secondary' : 'destructive'} className="text-xs">
                      {stat.status}
                    </Badge>
                  </TableCell>
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
