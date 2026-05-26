'use client'

import { useState } from 'react'
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
import { ArrowLeft, ArrowUpDown, Filter } from 'lucide-react'

// 임시 데이터 (실제로는 API에서 가져올 데이터)
const getIndicatorData = (id: string) => {
  const categories = ['완전성', '정확성', '일관성']
  const categoryIndex = Math.floor((parseInt(id) - 1) / 9)
  const indicatorIndex = (parseInt(id) - 1) % 9
  
  // 고정된 점수 생성 (하이드레이션 오류 방지)
  const scores = [
    { db1: 95.2, db2: 92.1, weight: 10, threshold: 95 },
    { db1: 93.5, db2: 89.3, weight: 9, threshold: 90 },
    { db1: 97.8, db2: 94.6, weight: 10, threshold: 95 },
    { db1: 91.2, db2: 87.5, weight: 8, threshold: 90 },
    { db1: 94.7, db2: 90.2, weight: 9, threshold: 93 },
    { db1: 96.3, db2: 93.8, weight: 10, threshold: 95 },
    { db1: 92.8, db2: 88.9, weight: 8, threshold: 90 },
    { db1: 95.6, db2: 91.7, weight: 9, threshold: 93 },
    { db1: 98.1, db2: 95.3, weight: 10, threshold: 95 },
  ]
  
  const scoreData = scores[indicatorIndex] || scores[0]

  return {
    id: parseInt(id),
    category: categories[categoryIndex],
    name: `${categories[categoryIndex]} 지표 ${indicatorIndex + 1}`,
    description: `${categories[categoryIndex]} 관련 품질 검증 지표입니다`,
    db1Score: scoreData.db1,
    db2Score: scoreData.db2,
    weight: scoreData.weight,
    threshold: scoreData.threshold,
    lastModified: '2024-01-15',
    appliedDate: '2024-01-10',
    appliedTables: [
      { db: '환자 진료 DB', table: 'patients', columns: ['patient_id', 'name', 'birth_date'], isActive: true, lastModified: '2024-01-15' },
      { db: '환자 진료 DB', table: 'visits', columns: ['visit_id', 'patient_id', 'visit_date'], isActive: true, lastModified: '2024-01-10' },
      { db: '환자 진료 DB', table: 'medical_records', columns: ['record_id', 'diagnosis'], isActive: false, lastModified: '2024-01-12' },
      { db: '임상시험 DB', table: 'subjects', columns: ['subject_id', 'enrollment_date'], isActive: true, lastModified: '2024-01-12' },
      { db: '임상시험 DB', table: 'trial_data', columns: ['trial_id', 'outcome', 'notes'], isActive: true, lastModified: '2024-01-14' },
    ],
  }
}

export default function IndicatorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const indicator = getIndicatorData(params.id as string)

  const [tableSortField, setTableSortField] = useState<'db' | 'table' | 'column' | 'lastModified' | null>(null)
  const [tableSortDirection, setTableSortDirection] = useState<'asc' | 'desc'>('asc')
  const [dbFilter, setDbFilter] = useState<string>('all')
  const [tableFilter, setTableFilter] = useState<string>('')
  const [columnFilter, setColumnFilter] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const handleTableSort = (field: 'db' | 'table' | 'column' | 'lastModified') => {
    if (tableSortField === field) {
      setTableSortDirection(tableSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setTableSortField(field)
      setTableSortDirection('asc')
    }
  }

  const getExpandedFilteredAndSortedTableData = () => {
    let filtered = indicator.appliedTables.flatMap((table) =>
      table.columns.map((column) => ({
        db: table.db,
        table: table.table,
        column: column,
        isActive: table.isActive,
        lastModified: table.lastModified,
      }))
    )

    // Apply filters
    if (dbFilter !== 'all') {
      filtered = filtered.filter((row) => row.db === dbFilter)
    }
    if (tableFilter) {
      filtered = filtered.filter((row) => row.table.toLowerCase().includes(tableFilter.toLowerCase()))
    }
    if (columnFilter) {
      filtered = filtered.filter((row) => row.column.toLowerCase().includes(columnFilter.toLowerCase()))
    }
    if (activeFilter !== 'all') {
      const isActive = activeFilter === 'active'
      filtered = filtered.filter((row) => row.isActive === isActive)
    }

    if (!tableSortField) return filtered

    return [...filtered].sort((a, b) => {
      const aVal = a[tableSortField]
      const bVal = b[tableSortField]
      const comparison = aVal.localeCompare(bVal)
      return tableSortDirection === 'asc' ? comparison : -comparison
    })
  }

  const uniqueDbs = Array.from(new Set(indicator.appliedTables.map((t) => t.db)))

  const getScoreColor = (score: number, threshold: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 85) return 'text-blue-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
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
                <CardTitle className="text-xl">{indicator.name}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <Badge variant="outline">{indicator.category}</Badge>
                  <span>가중치: {indicator.weight}</span>
                  <span>기준값: {indicator.threshold}</span>
                  <span>수정: {indicator.lastModified}</span>
                  <span>적용: {indicator.appliedDate}</span>
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
                <Badge variant="outline">{indicator.category}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">설명:</span>
                <span>{indicator.description}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">현재 점수</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">환자 진료 DB:</span>
                <span className={`font-bold ${getScoreColor(indicator.db1Score, indicator.threshold)}`}>
                  {indicator.db1Score.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">임상시험 DB:</span>
                <span className={`font-bold ${getScoreColor(indicator.db2Score, indicator.threshold)}`}>
                  {indicator.db2Score.toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applied Tables */}
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
                        onChange={(e) => setActiveFilter(e.target.value)}
                        className="h-7 px-1 text-xs border rounded bg-background w-full"
                      >
                        <option value="all">전체</option>
                        <option value="active">적용</option>
                        <option value="inactive">미적용</option>
                      </select>
                    </TableHead>
                    <TableHead className="text-xs">
                      <select
                        value={dbFilter}
                        onChange={(e) => setDbFilter(e.target.value)}
                        className="h-7 px-2 text-xs border rounded bg-background w-full"
                      >
                        <option value="all">모든 DB</option>
                        {uniqueDbs.map((db) => (
                          <option key={db} value={db}>{db}</option>
                        ))}
                      </select>
                    </TableHead>
                    <TableHead className="text-xs">
                      <Input
                        placeholder="테이블 검색..."
                        value={tableFilter}
                        onChange={(e) => setTableFilter(e.target.value)}
                        className="h-7 px-2 text-xs"
                      />
                    </TableHead>
                    <TableHead className="text-xs">
                      <Input
                        placeholder="컬럼 검색..."
                        value={columnFilter}
                        onChange={(e) => setColumnFilter(e.target.value)}
                        className="h-7 px-2 text-xs"
                      />
                    </TableHead>
                    <TableHead className="text-xs">
                      <span className="text-muted-foreground">마지막 수정</span>
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
                        onClick={() => handleTableSort('db')}
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
                        onClick={() => handleTableSort('table')}
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
                        onClick={() => handleTableSort('column')}
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
                        onClick={() => handleTableSort('lastModified')}
                        className="h-7 px-2 gap-1 hover:bg-transparent"
                      >
                        마지막 수정
                        <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getExpandedFilteredAndSortedTableData().map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">
                        <Checkbox checked={row.isActive} disabled />
                      </TableCell>
                      <TableCell className="text-xs">{row.db}</TableCell>
                      <TableCell className="text-xs font-medium">{row.table}</TableCell>
                      <TableCell className="text-xs">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          {row.column}
                        </code>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.lastModified}</TableCell>
                    </TableRow>
                  ))}
                  {getExpandedFilteredAndSortedTableData().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                        필터 조건에 맞는 데이터가 없습니다
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
