'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ArrowUpDown } from 'lucide-react'
import { ScoreText, getScoreColor } from '@/components/score-display'
import { DualScoreChart } from './dual-score-chart'
import { generateDualDbHistory } from '../_data/score-history'
import type { IndicatorDetail } from '../_data/quality-data'

interface IndicatorDetailDialogProps {
  indicator: IndicatorDetail | null
  onClose: () => void
}

type SortField = 'db' | 'table' | 'column' | 'score'

export function IndicatorDetailDialog({ indicator, onClose }: IndicatorDetailDialogProps) {
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

  const uniqueDbs = useMemo(() => {
    if (!indicator) return []
    return Array.from(new Set(indicator.tableColumnResults.map(r => r.db)))
  }, [indicator])

  return (
    <Dialog open={!!indicator} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-8 lg:p-12">
        <DialogHeader>
          <DialogTitle className="text-lg">{indicator?.name}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
            <Badge variant="outline">{indicator?.category}</Badge>
            <span>가중치: {indicator?.weight}</span>
            <span>기준값: {indicator?.threshold}</span>
            <span>수정: {indicator?.lastModified}</span>
            <span>적용: {indicator?.appliedDate}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">지표 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">카테고리</span>
                  <Badge variant="outline">{indicator?.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">설명</span>
                  <span>{indicator?.description}</span>
                </div>
                <div className="flex justify-between pt-1 border-t">
                  <span className="text-muted-foreground">환자 진료 DB</span>
                  <ScoreText score={indicator?.db1Score ?? 0} className="text-sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">임상시험 DB</span>
                  <ScoreText score={indicator?.db2Score ?? 0} className="text-sm" />
                </div>
              </CardContent>
            </Card>
            <Card className="sm:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">DB별 점수 추이 (최근 6개월)</CardTitle>
              </CardHeader>
              <CardContent>
                {indicator && (
                  <DualScoreChart
                    data={generateDualDbHistory(indicator.db1Score, indicator.db2Score, indicator.name)}
                    height="h-[160px]"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">적용 대상 테이블 및 컬럼</h4>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs w-16">
                      <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="h-7 px-1 text-xs border rounded bg-background w-full">
                        <option value="all">전체</option>
                        <option value="active">적용</option>
                        <option value="inactive">미적용</option>
                      </select>
                    </TableHead>
                    <TableHead className="text-xs">
                      <select value={dbFilter} onChange={(e) => setDbFilter(e.target.value)} className="h-7 px-2 text-xs border rounded bg-background w-full">
                        <option value="all">모든 DB</option>
                        {uniqueDbs.map(db => <option key={db} value={db}>{db}</option>)}
                      </select>
                    </TableHead>
                    <TableHead className="text-xs">
                      <Input placeholder="테이블 검색..." value={tableFilter} onChange={(e) => setTableFilter(e.target.value)} className="h-7 px-2 text-xs" />
                    </TableHead>
                    <TableHead className="text-xs">
                      <Input placeholder="컬럼 검색..." value={columnFilter} onChange={(e) => setColumnFilter(e.target.value)} className="h-7 px-2 text-xs" />
                    </TableHead>
                    <TableHead className="text-xs text-center">
                      <span className="text-muted-foreground">점수</span>
                    </TableHead>
                    <TableHead className="text-xs">
                      <span className="text-muted-foreground">마지막 확인</span>
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-xs w-16">적용</TableHead>
                    {(['db', 'table', 'column', 'score'] as const).map(field => (
                      <TableHead key={field} className={field === 'score' ? 'text-xs text-center' : 'text-xs'}>
                        <Button variant="ghost" size="sm" onClick={() => handleSort(field)} className="h-7 px-2 gap-1 hover:bg-transparent">
                          {{ db: 'DB명', table: '테이블명', column: '컬럼명', score: '점수' }[field]}
                          <ArrowUpDown className="w-3 h-3" />
                        </Button>
                      </TableHead>
                    ))}
                    <TableHead className="text-xs">마지막 확인</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">
                        <Checkbox checked={row.isActive} disabled />
                      </TableCell>
                      <TableCell className="text-xs">{row.db}</TableCell>
                      <TableCell className="text-xs font-medium">{row.table}</TableCell>
                      <TableCell className="text-xs">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{row.column}</code>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-sm font-bold ${getScoreColor(row.score)}`}>{row.score}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.lastChecked}</TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                        필터 조건에 맞는 데이터가 없습니다
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
