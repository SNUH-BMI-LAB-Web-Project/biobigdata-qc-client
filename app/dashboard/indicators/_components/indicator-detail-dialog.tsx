'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DualScoreChart } from '@/app/dashboard/_components/dual-score-chart'
import { generateDualDbHistory } from '@/app/dashboard/_data/score-history'
import { INDICATOR_TARGET_ROWS, type IndicatorTargetRow } from '../_data/indicator-target-rows'
import { CATEGORIES } from '../_data'
import type { Indicator } from '../_data'
import { ScoreText } from '@/components/score-display'
import { cn } from '@/lib/utils'

type Props = {
  indicator: Indicator | null
  indicators: Indicator[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (id: number) => void
}

export function IndicatorDetailDialog({
  indicator,
  indicators,
  open,
  onOpenChange,
  onNavigate,
}: Props) {
  const [targetRows, setTargetRows] = useState<IndicatorTargetRow[]>([])
  const [applyScope, setApplyScope] = useState<'all' | 'applied' | 'unapplied'>('all')
  const [dbScope, setDbScope] = useState<'all' | 'patient' | 'clinical'>('all')
  const [tableSearch, setTableSearch] = useState('')
  const [columnSearch, setColumnSearch] = useState('')

  useEffect(() => {
    if (open && indicator) {
      setTargetRows(INDICATOR_TARGET_ROWS.map(r => ({ ...r })))
      setApplyScope('all')
      setDbScope('all')
      setTableSearch('')
      setColumnSearch('')
    }
  }, [open, indicator?.id])

  const dualChartData = useMemo(() => {
    if (!indicator) return null
    return generateDualDbHistory(indicator.db1Score, indicator.db2Score, indicator.name)
  }, [indicator])

  const indicatorsByCategory = useMemo(() => {
    const map = new Map<string, Indicator[]>()
    for (const c of CATEGORIES) map.set(c, [])
    for (const ind of indicators) {
      const list = map.get(ind.category)
      if (list) list.push(ind)
    }
    for (const c of CATEGORIES) {
      map.get(c)!.sort((a, b) => a.id - b.id)
    }
    return map
  }, [indicators])

  const categoryIndex = indicator
    ? CATEGORIES.indexOf(indicator.category as (typeof CATEGORIES)[number])
    : -1
  const indicatorsInCurrentCategory = indicator
    ? (indicatorsByCategory.get(indicator.category) ?? [])
    : []

  const filteredTargets = useMemo(() => {
    const tq = tableSearch.trim().toLowerCase()
    const cq = columnSearch.trim().toLowerCase()
    return targetRows.filter(row => {
      if (applyScope === 'applied' && !row.applied) return false
      if (applyScope === 'unapplied' && row.applied) return false
      if (dbScope === 'patient' && !row.dbLabel.includes('환자')) return false
      if (dbScope === 'clinical' && !row.dbLabel.includes('임상')) return false
      if (tq && !row.tableName.toLowerCase().includes(tq)) return false
      if (cq && !row.columnName.toLowerCase().includes(cq)) return false
      return true
    })
  }, [targetRows, applyScope, dbScope, tableSearch, columnSearch])

  const toggleTarget = (id: string) => {
    setTargetRows(prev => prev.map(r => (r.id === id ? { ...r, applied: !r.applied } : r)))
  }

  return (
    <Dialog open={open && !!indicator} onOpenChange={onOpenChange}>
      {indicator ? (
      <DialogContent className="flex max-h-[92vh] min-h-[min(82vh,900px)] flex-col gap-0 overflow-y-auto p-0 sm:max-w-5xl">
        <DialogHeader className="space-y-4 px-6 py-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">카테고리</p>
            <nav
              className="flex flex-wrap gap-x-1 border-b border-border"
              aria-label="품질 지표 카테고리"
            >
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    const first = indicatorsByCategory.get(cat)?.[0]
                    if (first) onNavigate(first.id)
                  }}
                  className={cn(
                    '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors sm:px-4',
                    i === categoryIndex
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                  )}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">상세 지표</p>
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch]">
              {indicatorsInCurrentCategory.map(ind => (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => onNavigate(ind.id)}
                  className={cn(
                    'max-w-[min(100%,12rem)] shrink-0 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors sm:max-w-[14rem]',
                    ind.id === indicator.id
                      ? 'border-primary/35 bg-primary/10 text-primary'
                      : 'border-transparent bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span className="line-clamp-2">{ind.name}</span>
                </button>
              ))}
            </div>
          </div>
          <DialogTitle className="text-lg">{indicator.name}</DialogTitle>
          <DialogDescription className="sr-only">
            {indicator.category} 지표, 가중치 {indicator.weight}, 기준값 {indicator.threshold}
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
                <p className="font-medium">{indicator.category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">설명</p>
                <p className="leading-relaxed text-muted-foreground">{indicator.description}</p>
              </div>
              <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">가중치</p>
                  <p className="font-medium tabular-nums">{indicator.weight}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">기준값</p>
                  <p className="font-medium tabular-nums">{indicator.threshold}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">수정</p>
                  <p className="text-muted-foreground">{indicator.lastModified}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">적용</p>
                  <p className="text-muted-foreground">{indicator.appliedDate}</p>
                </div>
              </div>
              <div className="space-y-3 border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground">현재 점수</p>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">환자 진료 DB</span>
                  <ScoreText score={indicator.db1Score} className="text-sm font-semibold tabular-nums" />
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">임상시험 DB</span>
                  <ScoreText score={indicator.db2Score} className="text-sm font-semibold tabular-nums" />
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
                <DualScoreChart dataByPeriod={dualChartData} height="h-[280px]" />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="shrink-0 px-6 py-4">
          <h3 className="mb-3 text-sm font-semibold">적용 대상 테이블 및 컬럼</h3>
          <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Select value={applyScope} onValueChange={v => setApplyScope(v as typeof applyScope)}>
              <SelectTrigger className="h-9 w-full sm:w-[7.5rem]">
                <SelectValue placeholder="적용" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="applied">적용</SelectItem>
                <SelectItem value="unapplied">미적용</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dbScope} onValueChange={v => setDbScope(v as typeof dbScope)}>
              <SelectTrigger className="h-9 w-full sm:w-[10rem]">
                <SelectValue placeholder="DB" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 DB</SelectItem>
                <SelectItem value="patient">환자 진료 DB</SelectItem>
                <SelectItem value="clinical">임상시험 DB</SelectItem>
              </SelectContent>
            </Select>
            <Input
              className="h-9 min-w-[8rem] flex-1 sm:max-w-[12rem]"
              placeholder="테이블 검색..."
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
            />
            <Input
              className="h-9 min-w-[8rem] flex-1 sm:max-w-[12rem]"
              placeholder="컬럼 검색..."
              value={columnSearch}
              onChange={e => setColumnSearch(e.target.value)}
            />
          </div>

          <div className="relative min-h-[min(560px,calc(100vh-24rem))] w-full min-w-0 overflow-x-auto rounded-md border">
            <Table className="min-w-[720px] border-collapse border-spacing-0 table-auto text-sm [&_th]:h-10">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 text-center text-xs">적용</TableHead>
                  <TableHead className="text-xs">DB명</TableHead>
                  <TableHead className="text-xs">테이블명</TableHead>
                  <TableHead className="text-xs">컬럼명</TableHead>
                  <TableHead className="w-20 text-left text-xs">점수</TableHead>
                  <TableHead className="w-28 text-xs">마지막 수정</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTargets.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={6}
                      className="min-h-[min(520px,calc(100vh-26rem))] align-middle text-center text-sm text-muted-foreground"
                    >
                      조건에 맞는 항목이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTargets.map(row => (
                    <TableRow key={row.id} className="hover:bg-muted/40">
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={row.applied}
                            onCheckedChange={() => toggleTarget(row.id)}
                            aria-label={`${row.tableName}.${row.columnName} 적용`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{row.dbLabel}</TableCell>
                      <TableCell className="font-mono text-xs font-medium">{row.tableName}</TableCell>
                      <TableCell className="font-mono text-xs">{row.columnName}</TableCell>
                      <TableCell className="text-left text-xs tabular-nums">
                        {(row.score ?? 0).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.lastModified}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
      ) : null}
    </Dialog>
  )
}
