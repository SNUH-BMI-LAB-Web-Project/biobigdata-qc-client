'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Database,
  Clock,
  FileCheck,
  Activity,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Download,
  Users,
  Calendar,
  HardDrive,
} from 'lucide-react'

type IndicatorDetail = {
  name: string
  category: string
  description: string
  score: number
  db1Score: number
  db2Score: number
  weight: number
  threshold: number
  lastModified: string
  appliedDate: string
  tableColumnResults: {
    db: string
    table: string
    column: string
    score: number
    isActive: boolean
    lastChecked: string
  }[]
}

// 품질지표 데이터 구조: 3개 카테고리, 각 9개 지표
const qualityData = {
  db1: {
    name: '환자 진료 DB (KR-CDI)',
    totalScore: 94.5,
    lastValidation: '2024-01-15 14:30',
    stats: {
      patients: 15234,
      visits: 48567,
      totalRecords: 125890,
    },
    categories: [
      {
        name: '완전성',
        score: 96.2,
        indicators: [
          { name: '필수 항목 완전성', score: 98.5 },
          { name: '선택 항목 완전성', score: 94.2 },
          { name: '레코드 완전성', score: 97.8 },
          { name: '시간 완전성', score: 95.6 },
          { name: '인구통계 완전성', score: 96.4 },
          { name: '진단 정보 완전성', score: 95.1 },
          { name: '처방 정보 완전성', score: 97.2 },
          { name: '검사 결과 완전성', score: 94.8 },
          { name: '종합 완전성', score: 96.0 },
        ],
      },
      {
        name: '정확성',
        score: 93.5,
        indicators: [
          { name: '데이터 형식 정확성', score: 95.2 },
          { name: '값 범위 정확성', score: 92.8 },
          { name: '코드 정확성', score: 94.5 },
          { name: '날짜 정확성', score: 91.2 },
          { name: '수치 정확성', score: 93.7 },
          { name: '참조 무결성', score: 95.8 },
          { name: '논리적 일관성', score: 92.1 },
          { name: '표준 준수율', score: 94.3 },
          { name: '종합 정확성', score: 93.6 },
        ],
      },
      {
        name: '일관성',
        score: 93.8,
        indicators: [
          { name: '시간적 일관성', score: 94.2 },
          { name: '데이터 간 일관성', score: 92.5 },
          { name: '형식 일관성', score: 95.8 },
          { name: '코드 일관성', score: 93.1 },
          { name: '중복 데이터 제거율', score: 94.7 },
          { name: '용어 일관성', score: 92.9 },
          { name: '단위 일관성', score: 95.2 },
          { name: '참조 일관성', score: 93.4 },
          { name: '종합 일관성', score: 93.9 },
        ],
      },
    ],
  },
  db2: {
    name: '임상시험 DB (통합 DB)',
    totalScore: 89.2,
    lastValidation: '2024-01-15 14:35',
    stats: {
      patients: 3456,
      visits: 12890,
      totalRecords: 45678,
    },
    categories: [
      {
        name: '완전성',
        score: 92.8,
        indicators: [
          { name: '필수 항목 완전성', score: 94.5 },
          { name: '선택 항목 완전성', score: 89.2 },
          { name: '레코드 완전성', score: 93.8 },
          { name: '시간 완전성', score: 91.6 },
          { name: '인구통계 완전성', score: 94.1 },
          { name: '진단 정보 완전성', score: 90.8 },
          { name: '처방 정보 완전성', score: 93.5 },
          { name: '검사 결과 완전성', score: 92.2 },
          { name: '종합 완전성', score: 92.9 },
        ],
      },
      {
        name: '정확성',
        score: 89.8,
        indicators: [
          { name: '데이터 형식 정확성', score: 91.2 },
          { name: '값 범위 정확성', score: 88.5 },
          { name: '코드 정확성', score: 90.1 },
          { name: '날짜 정확성', score: 87.8 },
          { name: '수치 정확성', score: 89.9 },
          { name: '참조 무결성', score: 92.3 },
          { name: '논리적 일관성', score: 88.2 },
          { name: '표준 준수율', score: 90.5 },
          { name: '종합 정확성', score: 89.8 },
        ],
      },
      {
        name: '일관성',
        score: 91.0,
        indicators: [
          { name: '시간적 일관성', score: 92.1 },
          { name: '데이터 간 일관성', score: 89.8 },
          { name: '형식 일관성', score: 93.2 },
          { name: '코드 일관성', score: 90.5 },
          { name: '중복 데이터 제거율', score: 91.8 },
          { name: '용어 일관성', score: 89.5 },
          { name: '단위 일관성', score: 92.7 },
          { name: '참조 일관성', score: 90.4 },
          { name: '종합 일관성', score: 91.2 },
        ],
      },
    ],
  },
}

export default function DashboardPage() {
  const [expandedDb, setExpandedDb] = useState<{ [key: string]: number | null }>({
    db1: null,
    db2: null,
  })
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorDetail | null>(null)
  const [tableSortField, setTableSortField] = useState<'db' | 'table' | 'column' | 'score' | null>(null)
  const [tableSortDirection, setTableSortDirection] = useState<'asc' | 'desc'>('asc')
  const [modalDbFilter, setModalDbFilter] = useState<string>('all')
  const [modalTableFilter, setModalTableFilter] = useState('')
  const [modalColumnFilter, setModalColumnFilter] = useState('')
  const [modalActiveFilter, setModalActiveFilter] = useState<string>('all')

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 90) return 'text-blue-600'
    if (score >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 95) return 'bg-green-100'
    if (score >= 90) return 'bg-blue-100'
    if (score >= 85) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const toggleCategory = (dbKey: string, categoryIndex: number) => {
    setExpandedDb((prev) => ({
      ...prev,
      [dbKey]: prev[dbKey] === categoryIndex ? null : categoryIndex,
    }))
  }

  const handleTableSort = (field: 'db' | 'table' | 'column' | 'score') => {
    if (tableSortField === field) {
      setTableSortDirection(tableSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setTableSortField(field)
      setTableSortDirection('asc')
    }
  }

  const getSortedTableData = () => {
    if (!selectedIndicator) return []
    
    let data = [...selectedIndicator.tableColumnResults]

    if (modalDbFilter !== 'all') {
      data = data.filter(row => row.db === modalDbFilter)
    }
    if (modalTableFilter) {
      data = data.filter(row => row.table.toLowerCase().includes(modalTableFilter.toLowerCase()))
    }
    if (modalColumnFilter) {
      data = data.filter(row => row.column.toLowerCase().includes(modalColumnFilter.toLowerCase()))
    }
    if (modalActiveFilter !== 'all') {
      const isActive = modalActiveFilter === 'active'
      data = data.filter(row => row.isActive === isActive)
    }
    
    if (!tableSortField) return data

    return data.sort((a, b) => {
      let comparison = 0
      if (tableSortField === 'score') {
        comparison = a.score - b.score
      } else {
        comparison = a[tableSortField].localeCompare(b[tableSortField])
      }
      return tableSortDirection === 'asc' ? comparison : -comparison
    })
  }

  const handleIndicatorClick = (dbKey: 'db1' | 'db2', categoryIndex: number, indicatorIndex: number) => {
    const data = qualityData[dbKey]
    const otherData = dbKey === 'db1' ? qualityData.db2 : qualityData.db1
    const category = data.categories[categoryIndex]
    const indicator = category.indicators[indicatorIndex]
    const otherIndicator = otherData.categories[categoryIndex].indicators[indicatorIndex]

    const tableColumnResults = [
      { db: '환자 진료 DB', table: 'patients', column: 'patient_id', score: indicator.score + 2, isActive: true, lastChecked: '2024-01-15 10:00' },
      { db: '환자 진료 DB', table: 'patients', column: 'name', score: indicator.score - 1, isActive: true, lastChecked: '2024-01-15 10:00' },
      { db: '환자 진료 DB', table: 'patients', column: 'birth_date', score: indicator.score + 1, isActive: true, lastChecked: '2024-01-15 10:00' },
      { db: '환자 진료 DB', table: 'visits', column: 'visit_id', score: indicator.score - 2, isActive: true, lastChecked: '2024-01-15 10:05' },
      { db: '환자 진료 DB', table: 'visits', column: 'visit_date', score: indicator.score, isActive: false, lastChecked: '2024-01-14 14:30' },
      { db: '환자 진료 DB', table: 'medical_records', column: 'record_id', score: indicator.score + 3, isActive: true, lastChecked: '2024-01-15 10:10' },
      { db: '환자 진료 DB', table: 'medical_records', column: 'diagnosis', score: indicator.score - 3, isActive: true, lastChecked: '2024-01-15 10:10' },
      { db: '임상시험 DB', table: 'subjects', column: 'subject_id', score: otherIndicator.score + 1, isActive: true, lastChecked: '2024-01-15 10:12' },
      { db: '임상시험 DB', table: 'subjects', column: 'enrollment_date', score: otherIndicator.score - 1, isActive: true, lastChecked: '2024-01-15 10:12' },
      { db: '임상시험 DB', table: 'trial_data', column: 'trial_id', score: otherIndicator.score + 2, isActive: true, lastChecked: '2024-01-14 14:00' },
      { db: '임상시험 DB', table: 'trial_data', column: 'outcome', score: otherIndicator.score - 2, isActive: true, lastChecked: '2024-01-14 14:00' },
      { db: '임상시험 DB', table: 'trial_data', column: 'notes', score: otherIndicator.score, isActive: false, lastChecked: '2024-01-14 14:00' },
    ]

    setSelectedIndicator({
      name: indicator.name,
      category: category.name,
      description: `${category.name} 관련 품질 검증 지표입니다`,
      score: indicator.score,
      db1Score: dbKey === 'db1' ? indicator.score : otherIndicator.score,
      db2Score: dbKey === 'db2' ? indicator.score : otherIndicator.score,
      weight: 8 + (indicatorIndex % 3),
      threshold: 90 + (indicatorIndex % 6),
      lastModified: '2024-01-15',
      appliedDate: '2024-01-10',
      tableColumnResults,
    })
  }

  const renderDatabase = (dbKey: 'db1' | 'db2') => {
    const data = qualityData[dbKey]

    return (
      <div key={dbKey} className="space-y-3">
        {/* Database Title */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Database className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-bold">{data.name}</h2>
        </div>

        {/* 1. Data Statistics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">데이터 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 flex-shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">현재 환자 수</p>
                  <p className="text-base font-bold">{data.stats.patients.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 flex-shrink-0">
                  <Calendar className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">전체 방문 수</p>
                  <p className="text-base font-bold">{data.stats.visits.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary flex-shrink-0">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">전체 데이터 수</p>
                  <p className="text-base font-bold">{data.stats.totalRecords.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Quality Validation Execution */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm">품질검증 실행 및 마지막 결과</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs mt-1">
                  <Clock className="w-3 h-3" />
                  {data.lastValidation}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  <FileCheck className="w-3 h-3" />
                  검증 실행
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  <Download className="w-3 h-3" />
                  리포트
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  <Activity className="w-3 h-3" />
                  이력
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Progress value={data.totalScore} className="h-1.5 flex-1" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">총점</span>
                <div className={`text-xl font-bold ${getScoreColor(data.totalScore)}`}>
                  {data.totalScore}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Scores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {data.categories.map((category, index) => (
            <Card
              key={index}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => toggleCategory(dbKey, index)}
            >
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs font-medium flex items-center justify-between">
                  {category.name}
                  {expandedDb[dbKey] === index ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`text-xl font-bold ${getScoreColor(category.score)}`}>
                    {category.score}
                  </div>
                  <Badge className={`${getScoreBgColor(category.score)} text-xs px-1.5 py-0`}>
                    <span className={getScoreColor(category.score)}>
                      {category.score >= 95 ? '우수' : category.score >= 90 ? '양호' : '보통'}
                    </span>
                  </Badge>
                </div>
                <Progress value={category.score} className="h-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Indicators */}
        {expandedDb[dbKey] !== null && (
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {data.categories[expandedDb[dbKey]!].name} - 상세 지표
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.categories[expandedDb[dbKey]!].indicators.map((indicator, index) => (
                  <div
                    key={index}
                    className="p-2 rounded border bg-card/50 space-y-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleIndicatorClick(dbKey, expandedDb[dbKey]!, index)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium leading-tight">{indicator.name}</h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${getScoreColor(indicator.score)}`}>
                        {indicator.score}
                      </span>
                      <Progress value={indicator.score} className="h-1 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Main Content */}
        <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Databases Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Database 1 - Left */}
          {renderDatabase('db1')}

          {/* Database 2 - Right */}
          {renderDatabase('db2')}
        </div>
      </main>
    </div>

    {/* Indicator Detail Dialog */}
    <Dialog
      open={!!selectedIndicator}
      onOpenChange={() => {
        setSelectedIndicator(null)
        setTableSortField(null)
        setTableSortDirection('asc')
        setModalDbFilter('all')
        setModalTableFilter('')
        setModalColumnFilter('')
        setModalActiveFilter('all')
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-8 lg:p-12">
        <DialogHeader>
          <DialogTitle className="text-lg">{selectedIndicator?.name}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
            <Badge variant="outline">{selectedIndicator?.category}</Badge>
            <span>가중치: {selectedIndicator?.weight}</span>
            <span>기준값: {selectedIndicator?.threshold}</span>
            <span>수정: {selectedIndicator?.lastModified}</span>
            <span>적용: {selectedIndicator?.appliedDate}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info & Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">지표 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">카테고리</span>
                  <Badge variant="outline">{selectedIndicator?.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">설명</span>
                  <span>{selectedIndicator?.description}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">현재 점수</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">환자 진료 DB</span>
                  <span className={`font-bold ${getScoreColor(selectedIndicator?.db1Score || 0)}`}>
                    {selectedIndicator?.db1Score}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">임상시험 DB</span>
                  <span className={`font-bold ${getScoreColor(selectedIndicator?.db2Score || 0)}`}>
                    {selectedIndicator?.db2Score}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table-Column Results */}
          <div>
            <h4 className="text-sm font-semibold mb-2">적용 대상 테이블 및 컬럼</h4>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs w-16">
                      <select
                        value={modalActiveFilter}
                        onChange={(e) => setModalActiveFilter(e.target.value)}
                        className="h-7 px-1 text-xs border rounded bg-background w-full"
                      >
                        <option value="all">전체</option>
                        <option value="active">적용</option>
                        <option value="inactive">미적용</option>
                      </select>
                    </TableHead>
                    <TableHead className="text-xs">
                      <select
                        value={modalDbFilter}
                        onChange={(e) => setModalDbFilter(e.target.value)}
                        className="h-7 px-2 text-xs border rounded bg-background w-full"
                      >
                        <option value="all">모든 DB</option>
                        {Array.from(new Set(selectedIndicator?.tableColumnResults.map(r => r.db) || [])).map((db) => (
                          <option key={db} value={db}>{db}</option>
                        ))}
                      </select>
                    </TableHead>
                    <TableHead className="text-xs">
                      <Input
                        placeholder="테이블 검색..."
                        value={modalTableFilter}
                        onChange={(e) => setModalTableFilter(e.target.value)}
                        className="h-7 px-2 text-xs"
                      />
                    </TableHead>
                    <TableHead className="text-xs">
                      <Input
                        placeholder="컬럼 검색..."
                        value={modalColumnFilter}
                        onChange={(e) => setModalColumnFilter(e.target.value)}
                        className="h-7 px-2 text-xs"
                      />
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
                    <TableHead className="text-xs">
                      <Button variant="ghost" size="sm" onClick={() => handleTableSort('db')} className="h-7 px-2 gap-1 hover:bg-transparent">
                        DB명 <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-xs">
                      <Button variant="ghost" size="sm" onClick={() => handleTableSort('table')} className="h-7 px-2 gap-1 hover:bg-transparent">
                        테이블명 <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-xs">
                      <Button variant="ghost" size="sm" onClick={() => handleTableSort('column')} className="h-7 px-2 gap-1 hover:bg-transparent">
                        컬럼명 <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-xs text-center">
                      <Button variant="ghost" size="sm" onClick={() => handleTableSort('score')} className="h-7 px-2 gap-1 hover:bg-transparent">
                        점수 <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-xs">마지막 확인</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedTableData().map((row, index) => (
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
                  {getSortedTableData().length === 0 && (
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
  </>
  )
}
