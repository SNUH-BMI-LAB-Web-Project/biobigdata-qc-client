'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ArrowUpDown } from 'lucide-react'
import { DualScoreChart } from './dual-score-chart'
import { generateDualDbHistory } from '../_data/score-history'
import { qualityData } from '../_data/quality-data'
import type { IndicatorDetail } from '../_data/quality-data'
import { ScoreText } from '@/components/score-display'
import { cn } from '@/lib/utils'

export type IndicatorSelection = {
  dbKey: 'db1' | 'db2'
  categoryIndex: number
  indicatorIndex: number
}

interface IndicatorDetailDialogProps {
  indicator: IndicatorDetail | null
  selection: IndicatorSelection | null
  onNavigate: (dbKey: 'db1' | 'db2', categoryIndex: number, indicatorIndex: number) => void
  onClose: () => void
}

type SortField = 'db' | 'table' | 'column' | 'score'

export function IndicatorDetailDialog({
  indicator,
  selection,
  onNavigate,
  onClose,
}: IndicatorDetailDialogProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [dbFilter, setDbFilter] = useState('all')
  const [tableFilter, setTableFilter] = useState('')
  const [columnFilter, setColumnFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const handleClose = () => {
    setSortField(null)
    setSortDirection('asc')
    setDbFilter('all')
    setTableFilter('')
    setColumnFilter('')
    setActiveFilter('all')
    onClose()
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredData = useMemo(() => {
    if (!indicator) return []

    let data = [...indicator.tableColumnResults]

    if (dbFilter !== 'all') data = data.filter(r => r.db === dbFilter)
    if (tableFilter) data = data.filter(r => r.table.toLowerCase().includes(tableFilter.toLowerCase()))
    if (columnFilter) data = data.filter(r => r.column.toLowerCase().includes(columnFilter.toLowerCase()))
    if (activeFilter !== 'all') {
      data = data.filter(r => r.isActive === (activeFilter === 'active'))
    }

    if (sortField) {
      data.sort((a, b) => {
        const cmp = sortField === 'score'
          ? a.score - b.score
          : a[sortField].localeCompare(b[sortField])
        return sortDirection === 'asc' ? cmp : -cmp
      })
    }

    return data
  }, [indicator, dbFilter, tableFilter, columnFilter, activeFilter, sortField, sortDirection])

  const dualChartData = useMemo(() => {
    if (!indicator) return null
    return generateDualDbHistory(indicator.db1Score, indicator.db2Score, indicator.name)
  }, [indicator])

  const uniqueDbs = useMemo(() => {
    if (!indicator) return []
    return Array.from(new Set(indicator.tableColumnResults.map(r => r.db)))
  }, [indicator])

  return (
    <Dialog open={!!indicator} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[92vh] min-h-[min(82vh,900px)] flex-col gap-0 overflow-y-auto p-0 sm:max-w-5xl">
        <DialogHeader className="space-y-4 px-6 py-4">
          {selection && indicator && (
            <>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">카테고리</p>
                <nav
                  className="flex flex-wrap gap-x-1 border-b border-border"
                  aria-label="품질 지표 카테고리"
                >
                  {qualityData[selection.dbKey].categories.map((cat, i) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => onNavigate(selection.dbKey, i, 0)}
                      className={cn(
                        '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors sm:px-4',
                        i === selection.categoryIndex
                          ? 'border-primary text-foreground'
                          : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">상세 지표</p>
                <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch]">
                  {qualityData[selection.dbKey].categories[selection.categoryIndex].indicators.map((ind, i) => (
                    <button
                      key={`${ind.name}-${i}`}
                      type="button"
                      onClick={() => onNavigate(selection.dbKey, selection.categoryIndex, i)}
                      className={cn(
                        'max-w-[min(100%,12rem)] shrink-0 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors sm:max-w-[14rem]',
                        i === selection.indicatorIndex
                          ? 'border-primary/35 bg-primary/10 text-primary'
                          : 'border-transparent bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <span className="line-clamp-2">{ind.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <DialogTitle className="text-lg">{indicator?.name}</DialogTitle>
          <DialogDescription className="sr-only">
            {indicator
              ? `${indicator.category} 지표, 가중치 ${indicator.weight}, 기준값 ${indicator.threshold}`
              : '지표 상세'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-6 pb-4 sm:grid-cols-3">
            <Card className="gap-0 py-0 sm:col-span-1">
              <CardHeader className="px-4 pt-3 pb-0">
                <CardTitle className="text-sm font-medium">지표 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 py-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">카테고리</p>
                  <p className="font-medium">{indicator?.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">설명</p>
                  <p className="leading-relaxed text-muted-foreground">{indicator?.description}</p>
                </div>
                <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">가중치</p>
                    <p className="font-medium tabular-nums">{indicator?.weight}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">기준값</p>
                    <p className="font-medium tabular-nums">{indicator?.threshold}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">수정</p>
                    <p className="text-muted-foreground">{indicator?.lastModified}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">적용</p>
                    <p className="text-muted-foreground">{indicator?.appliedDate}</p>
                  </div>
                </div>
                <div className="space-y-3 border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground">현재 점수</p>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">환자 진료 DB</span>
                    {indicator != null && (
                      <ScoreText score={indicator.db1Score} className="text-sm font-semibold tabular-nums" />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">임상시험 DB</span>
                    {indicator != null && (
                      <ScoreText score={indicator.db2Score} className="text-sm font-semibold tabular-nums" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="flex min-h-[320px] min-w-0 flex-col gap-0 py-0 sm:col-span-2">
              <CardHeader className="px-4 pt-3 pb-0">
                <CardTitle className="text-sm font-medium">DB별 점수 추이</CardTitle>
              </CardHeader>
              <CardContent className="min-h-0 flex-1 px-4 py-4">
                {dualChartData && (
                  <DualScoreChart
                    dataByPeriod={dualChartData}
                    height="h-[280px]"
                  />
                )}
              </CardContent>
            </Card>
        </div>

        <div className="shrink-0 px-6 py-4">
          <h3 className="mb-3 text-sm font-semibold">적용 대상 테이블 및 컬럼</h3>
          <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="h-9 w-full sm:w-[7.5rem]">
                <SelectValue placeholder="적용" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">적용</SelectItem>
                <SelectItem value="inactive">미적용</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dbFilter} onValueChange={setDbFilter}>
              <SelectTrigger className="h-9 w-full min-w-0 sm:max-w-[14rem] sm:w-[12rem]">
                <SelectValue placeholder="DB" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 DB</SelectItem>
                {uniqueDbs.map(db => (
                  <SelectItem key={db} value={db}>
                    {db}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="h-9 min-w-[8rem] flex-1 sm:max-w-[12rem]"
              placeholder="테이블 검색..."
              value={tableFilter}
              onChange={e => setTableFilter(e.target.value)}
            />
            <Input
              className="h-9 min-w-[8rem] flex-1 sm:max-w-[12rem]"
              placeholder="컬럼 검색..."
              value={columnFilter}
              onChange={e => setColumnFilter(e.target.value)}
            />
          </div>

          <div className="relative min-h-[min(560px,calc(100vh-24rem))] w-full min-w-0 overflow-x-auto rounded-md border">
            <Table className="min-w-[720px] border-collapse border-spacing-0 table-auto text-sm [&_th]:h-10">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 text-center text-xs">적용</TableHead>
                  {(['db', 'table', 'column', 'score'] as const).map(field => (
                    <TableHead
                      key={field}
                      className={field === 'score' ? 'w-20 text-left text-xs' : 'text-xs'}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort(field)}
                        className={field === 'score' ? 'h-8 w-full justify-start gap-1 px-2 hover:bg-transparent' : 'h-8 gap-1 px-2 hover:bg-transparent'}
                      >
                        {{ db: 'DB명', table: '테이블명', column: '컬럼명', score: '점수' }[field]}
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                  ))}
                  <TableHead className="text-xs">마지막 확인</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={6}
                      className="min-h-[min(520px,calc(100vh-26rem))] align-middle text-center text-sm text-muted-foreground"
                    >
                      조건에 맞는 항목이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/40">
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Checkbox checked={row.isActive} disabled aria-label={`${row.table}.${row.column} 적용`} />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{row.db}</TableCell>
                      <TableCell className="font-mono text-xs font-medium">{row.table}</TableCell>
                      <TableCell className="font-mono text-xs">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.column}</code>
                      </TableCell>
                      <TableCell className="text-left text-xs tabular-nums">{row.score}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.lastChecked}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
