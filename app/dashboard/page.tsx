'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

// 지표별 테이블-컬럼 상세 데이터
type IndicatorDetail = {
  name: string
  score: number
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
  const router = useRouter()
  const [expandedDb, setExpandedDb] = useState<{ [key: string]: number | null }>({
    db1: null,
    db2: null,
  })
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorDetail | null>(null)
  const [tableSortField, setTableSortField] = useState<'db' | 'table' | 'column' | 'score' | null>(null)
  const [tableSortDirection, setTableSortDirection] = useState<'asc' | 'desc'>('asc')

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
    
    // 적용된 항목만 필터링
    const data = selectedIndicator.tableColumnResults.filter(row => row.isActive)
    
    if (!tableSortField) return data

    return [...data].sort((a, b) => {
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
    const indicator = data.categories[categoryIndex].indicators[indicatorIndex]
    
    // 샘플 테이블-컬럼 데이터 생성
    const tableColumnResults = [
      { db: data.name, table: 'patients', column: 'patient_id', score: indicator.score + 2, isActive: true, lastChecked: '2024-01-15 10:00' },
      { db: data.name, table: 'patients', column: 'name', score: indicator.score - 1, isActive: true, lastChecked: '2024-01-15 10:00' },
      { db: data.name, table: 'patients', column: 'birth_date', score: indicator.score + 1, isActive: true, lastChecked: '2024-01-15 10:00' },
      { db: data.name, table: 'visits', column: 'visit_id', score: indicator.score - 2, isActive: true, lastChecked: '2024-01-15 10:05' },
      { db: data.name, table: 'visits', column: 'visit_date', score: indicator.score, isActive: false, lastChecked: '2024-01-14 14:30' },
      { db: data.name, table: 'medical_records', column: 'record_id', score: indicator.score + 3, isActive: true, lastChecked: '2024-01-15 10:10' },
      { db: data.name, table: 'medical_records', column: 'diagnosis', score: indicator.score - 3, isActive: true, lastChecked: '2024-01-15 10:10' },
    ]

    setSelectedIndicator({
      name: indicator.name,
      score: indicator.score,
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
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">현재 환자 수</p>
                  <p className="text-base font-bold">{data.stats.patients.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10">
                  <Calendar className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">전체 방문 수</p>
                  <p className="text-base font-bold">{data.stats.visits.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">품질검증 실행 및 마지막 결과</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs mt-1">
                  <Clock className="w-3 h-3" />
                  {data.lastValidation}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
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
        <div className="grid grid-cols-3 gap-2">
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
              <div className="grid grid-cols-3 gap-2">
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
        <div className="grid grid-cols-2 gap-4">
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
      }}
    >
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">{selectedIndicator?.name}</DialogTitle>
              <DialogDescription className="text-sm">
                전체 점수: <span className={`font-bold ${getScoreColor(selectedIndicator?.score || 0)}`}>{selectedIndicator?.score}</span>
              </DialogDescription>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                const indicatorId = qualityData.db1.categories.flatMap(c => c.indicators).findIndex(i => i.name === selectedIndicator?.name) + 1
                router.push(`/dashboard/indicators/${indicatorId}`)
              }}
            >
              지표 상세 정보
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Table-Column Results */}
          <div>
            <h4 className="text-sm font-semibold mb-2">테이블-컬럼별 검증 결과</h4>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
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
                    <TableHead className="text-xs text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTableSort('score')}
                        className="h-7 px-2 gap-1 hover:bg-transparent"
                      >
                        점수
                        <ArrowUpDown className="w-3 h-3" />
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
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          {row.column}
                        </code>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-sm font-bold ${getScoreColor(row.score)}`}>
                          {row.score}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.lastChecked}</TableCell>
                    </TableRow>
                  ))}
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
