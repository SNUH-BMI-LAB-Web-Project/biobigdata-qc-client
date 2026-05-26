'use client'

import { useState, Fragment } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'

import {
  Database,
  Clock,
  FileCheck,
  Play,
  CheckCircle2,
  AlertCircle,
  FileDown,
  ExternalLink,
  BarChart3,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  User,
} from 'lucide-react'

// 검증 대상 데이터 목록
const verificationDatasets = [
  { id: 1, name: '1차생성_참여자모집' },
  { id: 2, name: '1차생성_문검진' },
  { id: 3, name: '1차생성_기초임상(KR-CDI)' },
  { id: 4, name: '1차생성_기초임상(CDM)' },
  { id: 5, name: '1차생성_희귀질환(eCRF)' },
  { id: 6, name: '2차연계_의무기록(PHR)' },
  { id: 7, name: '2차연계_공공데이터' },
  { id: 8, name: '2차연계_PGHD' },
]

// DB별 선택 가능한 데이터 ID
const dbDatasetMapping: Record<string, number[]> = {
  linkage: [1, 2, 3, 5, 6, 7, 8],
  preprocess: [1, 2, 3, 4, 5, 6, 7, 8],
  integrate: [4, 5],
  open: [4, 5],
}

// DB 목록
const databases = [
  { id: 'linkage', name: '연계DB', description: '원천 데이터 연계 저장소' },
  { id: 'preprocess', name: '전처리DB', description: '데이터 정제 및 전처리 저장소' },
  { id: 'integrate', name: '통합DB', description: '통합 데이터 저장소' },
  { id: 'open', name: '개방DB', description: '데이터 개방 저장소' },
]

// 지표 유형
const indicatorTypes = [
  { id: 'quality', name: '품질지표', icon: ClipboardCheck },
  { id: 'stats', name: '통계지표', icon: BarChart3 },
]

// 검증 현황 데이터 (히스토리)
const verificationHistory = [
  {
    id: 1,
    db: '연계DB',
    dbId: 'linkage',
    startedAt: '2024-01-15 14:30',
    endedAt: '2024-01-15 14:45',
    executedBy: '홍길동',
    indicatorType: '품질지표',
    status: 'completed' as const,
    datasetDetails: [
      { name: '1차생성_문검진', startedAt: '2024-01-15 14:30', endedAt: '2024-01-15 14:35', score: 95.2, queryCount: 12 },
      { name: '1차생성_기초임상(KR-CDI)', startedAt: '2024-01-15 14:35', endedAt: '2024-01-15 14:45', score: 92.8, queryCount: 18 },
    ],
  },
  {
    id: 2,
    db: '연계DB',
    dbId: 'linkage',
    startedAt: '2024-01-15 14:35',
    endedAt: '2024-01-15 14:42',
    executedBy: '홍길동',
    indicatorType: '통계지표',
    status: 'completed' as const,
    datasetDetails: [
      { name: '1차생성_문검진', startedAt: '2024-01-15 14:35', endedAt: '2024-01-15 14:42', score: 100, queryCount: 8 },
    ],
  },
  {
    id: 3,
    db: '전처리DB',
    dbId: 'preprocess',
    startedAt: '2024-01-15 13:00',
    endedAt: '2024-01-15 13:28',
    executedBy: '김철수',
    indicatorType: '품질지표',
    status: 'completed' as const,
    datasetDetails: [
      { name: '1차생성_문검진', startedAt: '2024-01-15 13:00', endedAt: '2024-01-15 13:08', score: 97.8, queryCount: 12 },
      { name: '1차생성_기초임상(KR-CDI)', startedAt: '2024-01-15 13:08', endedAt: '2024-01-15 13:18', score: 96.5, queryCount: 15 },
      { name: '1차생성_기초임상(CDM)', startedAt: '2024-01-15 13:18', endedAt: '2024-01-15 13:28', score: 98.2, queryCount: 20 },
    ],
  },
  {
    id: 4,
    db: '통합DB',
    dbId: 'integrate',
    startedAt: '2024-01-14 18:00',
    endedAt: '2024-01-14 18:15',
    executedBy: '이영희',
    indicatorType: '품질지표',
    status: 'error' as const,
    datasetDetails: [
      { name: '1차생성_기초임상(CDM)', startedAt: '2024-01-14 18:00', endedAt: '2024-01-14 18:10', score: 82.3, queryCount: 18 },
      { name: '1차생성_희귀질환(eCRF)', startedAt: '2024-01-14 18:10', endedAt: '2024-01-14 18:15', score: 0, queryCount: 5, error: '연결 오류' },
    ],
  },
  {
    id: 5,
    db: '개방DB',
    dbId: 'open',
    startedAt: '2024-01-15 09:00',
    endedAt: '2024-01-15 09:12',
    executedBy: '박민수',
    indicatorType: '품질지표',
    status: 'completed' as const,
    datasetDetails: [
      { name: '1차생성_기초임상(CDM)', startedAt: '2024-01-15 09:00', endedAt: '2024-01-15 09:12', score: 98.5, queryCount: 22 },
    ],
  },
  {
    id: 6,
    db: '연계DB',
    dbId: 'linkage',
    startedAt: '2024-01-14 16:20',
    endedAt: '2024-01-14 16:35',
    executedBy: '홍길동',
    indicatorType: '품질지표',
    status: 'completed' as const,
    datasetDetails: [
      { name: '2차연계_의무기록(PHR)', startedAt: '2024-01-14 16:20', endedAt: '2024-01-14 16:35', score: 94.1, queryCount: 14 },
    ],
  },
  {
    id: 7,
    db: '전처리DB',
    dbId: 'preprocess',
    startedAt: '2024-01-14 11:00',
    endedAt: '2024-01-14 11:18',
    executedBy: '김철수',
    indicatorType: '통계지표',
    status: 'completed' as const,
    datasetDetails: [
      { name: '1차생성_문검진', startedAt: '2024-01-14 11:00', endedAt: '2024-01-14 11:08', score: 100, queryCount: 6 },
      { name: '2차연계_공공데이터', startedAt: '2024-01-14 11:08', endedAt: '2024-01-14 11:18', score: 98.5, queryCount: 8 },
    ],
  },
  {
    id: 8,
    db: '연계DB',
    dbId: 'linkage',
    startedAt: '2024-01-13 15:30',
    endedAt: null,
    executedBy: '이영희',
    indicatorType: '품질지표',
    status: 'inProgress' as const,
    datasetDetails: [
      { name: '2차연계_PGHD', startedAt: '2024-01-13 15:30', endedAt: null, score: null, queryCount: 3, progress: '진행중 (3/15)' },
    ],
  },
  {
    id: 9,
    db: '전처리DB',
    dbId: 'preprocess',
    startedAt: '2024-01-13 10:00',
    endedAt: '2024-01-13 10:22',
    executedBy: '박민수',
    indicatorType: '품질지표',
    status: 'completed' as const,
    datasetDetails: [
      { name: '1차생성_희귀질환(eCRF)', startedAt: '2024-01-13 10:00', endedAt: '2024-01-13 10:22', score: 94.1, queryCount: 16 },
    ],
  },
  {
    id: 10,
    db: '통합DB',
    dbId: 'integrate',
    startedAt: '2024-01-12 17:00',
    endedAt: '2024-01-12 17:15',
    executedBy: '홍길동',
    indicatorType: '품질지표',
    status: 'completed' as const,
    datasetDetails: [
      { name: '1차생성_기초임상(CDM)', startedAt: '2024-01-12 17:00', endedAt: '2024-01-12 17:15', score: 97.2, queryCount: 20 },
    ],
  },
  {
    id: 11,
    db: '개방DB',
    dbId: 'open',
    startedAt: '2024-01-12 14:00',
    endedAt: '2024-01-12 14:05',
    executedBy: '김철수',
    indicatorType: '통계지표',
    status: 'error' as const,
    datasetDetails: [
      { name: '1차생성_희귀질환(eCRF)', startedAt: '2024-01-12 14:00', endedAt: '2024-01-12 14:05', score: 0, queryCount: 2, error: '통계 산출 실패' },
    ],
  },
  {
    id: 12,
    db: '연계DB',
    dbId: 'linkage',
    startedAt: '2024-01-11 09:30',
    endedAt: '2024-01-11 10:05',
    executedBy: '이영희',
    indicatorType: '품질지표',
    status: 'completed' as const,
    datasetDetails: [
      { name: '1차생성_문검진', startedAt: '2024-01-11 09:30', endedAt: '2024-01-11 09:42', score: 96.4, queryCount: 12 },
      { name: '1차생성_기초임상(KR-CDI)', startedAt: '2024-01-11 09:42', endedAt: '2024-01-11 09:55', score: 94.2, queryCount: 15 },
      { name: '2차연계_공공데이터', startedAt: '2024-01-11 09:55', endedAt: '2024-01-11 10:05', score: 95.8, queryCount: 10 },
    ],
  },
]

const ITEMS_PER_PAGE = 5

export default function QualityVerificationPage() {
  const [selectedDb, setSelectedDb] = useState<string>('')
  const [selectedDatasets, setSelectedDatasets] = useState<number[]>([])
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([])
  const [statisticsDetailLevel, setStatisticsDetailLevel] = useState<'simple' | 'detailed'>('simple')
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  // 페이지네이션
  const totalPages = Math.ceil(verificationHistory.length / ITEMS_PER_PAGE)
  const paginatedHistory = verificationHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // DB 선택 시 선택 가능한 데이터셋 필터링
  const getAvailableDatasets = () => {
    if (!selectedDb) return []
    return verificationDatasets.filter(dataset => 
      dbDatasetMapping[selectedDb]?.includes(dataset.id)
    )
  }

  // DB 변경 시 데이터셋 초기화
  const handleDbChange = (dbId: string) => {
    setSelectedDb(dbId)
    setSelectedDatasets([])
    setSelectedIndicators([])
  }

  // 데이터셋 토글
  const toggleDataset = (datasetId: number) => {
    setSelectedDatasets(prev => 
      prev.includes(datasetId) 
        ? prev.filter(id => id !== datasetId)
        : [...prev, datasetId]
    )
  }

  // 지표 토글
  const toggleIndicator = (indicatorId: string) => {
    setSelectedIndicators(prev =>
      prev.includes(indicatorId)
        ? prev.filter(id => id !== indicatorId)
        : [...prev, indicatorId]
    )
  }

  // 행 펼침/접힘 토글
  const toggleRow = (rowId: number) => {
    setExpandedRows(prev =>
      prev.includes(rowId)
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    )
  }

  // 실행 가능 여부
  const canExecute = selectedDb && selectedDatasets.length > 0 && selectedIndicators.length > 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="gap-1 text-xs bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3" />{'완료'}</Badge>
      case 'inProgress':
        return <Badge variant="default" className="gap-1 text-xs bg-blue-100 text-blue-800"><Clock className="w-3 h-3 animate-spin" />{'진행중'}</Badge>
      case 'error':
        return <Badge variant="destructive" className="gap-1 text-xs"><AlertCircle className="w-3 h-3" />{'오류'}</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{'대기'}</Badge>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 90) return 'text-primary'
    if (score >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">{'품질검증 실행'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {'검증 대상 선택 및 품질/통계 지표 검증 실행'}
          </p>
        </div>

        {/* Selection Panel */}
        <div className="grid grid-cols-3 gap-4">
          {/* DB Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                {'1. 검증 대상 DB'}
              </CardTitle>
              <CardDescription className="text-xs">
                {'검증할 데이터베이스를 선택하세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {databases.map((db) => (
                  <div
                    key={db.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDb === db.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={() => handleDbChange(db.id)}
                  >
                    <div className="font-medium text-sm">{db.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{db.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dataset Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                {'2. 검증 대상 데이터'}
              </CardTitle>
              <CardDescription className="text-xs">
                {'검증할 데이터를 선택하세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedDb ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  {'먼저 검증 대상 DB를 선택하세요'}
                </div>
              ) : (
                <div className="space-y-2">
                  {getAvailableDatasets().map((dataset) => (
                    <div
                      key={dataset.id}
                      className={`flex items-center gap-2 p-3 rounded-md border-2 cursor-pointer transition-all ${
                        selectedDatasets.includes(dataset.id) ? 'bg-primary/10 border-primary' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                      onClick={() => toggleDataset(dataset.id)}
                    >
                      <Checkbox 
                        checked={selectedDatasets.includes(dataset.id)} 
                        onCheckedChange={() => toggleDataset(dataset.id)}
                      />
                      <span className="text-sm">{dataset.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Indicator Type Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                {'3. 검증 지표 유형'}
              </CardTitle>
              <CardDescription className="text-xs">
                {'실행할 지표 유형을 선택하세요'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDatasets.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-2">
                  {'먼저 검증 대상 데이터를 선택하세요'}
                </div>
              ) : (
                <div className="space-y-2">
                  {indicatorTypes.map((indicator) => {
                    const Icon = indicator.icon
                    const isStatistics = indicator.id === 'stats'
                    const isSelected = selectedIndicators.includes(indicator.id)
                    return (
                      <div
                        key={indicator.id}
                        className={`flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleIndicator(indicator.id)}
                      >
                        <Checkbox 
                          checked={isSelected} 
                          onCheckedChange={() => toggleIndicator(indicator.id)}
                        />
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium flex-1">{indicator.name}</p>
                        {/* 통계지표 - 간단/상세 토글 */}
                        {isStatistics && isSelected && (
                          <div 
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className={`text-xs ${statisticsDetailLevel === 'simple' ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>{'간단'}</span>
                            <Switch
                              checked={statisticsDetailLevel === 'detailed'}
                              onCheckedChange={(checked) => setStatisticsDetailLevel(checked ? 'detailed' : 'simple')}
                            />
                            <span className={`text-xs ${statisticsDetailLevel === 'detailed' ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>{'상세'}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Execute Button */}
              <div className="pt-3 border-t">
                <Button 
                  className="w-full gap-2" 
                  disabled={!canExecute}
                  onClick={() => alert('검���이 ���작되었습니���.')}
                >
                  <Play className="w-4 h-4" />
                  {'선택 항목 검증 실행'}
                </Button>
                {canExecute && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {databases.find(d => d.id === selectedDb)?.name}{' / '}
                    {selectedDatasets.length}{'개 데이터 / '}
                    {selectedIndicators.length}{'개 지표'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification History Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{'검증 현황'}</CardTitle>
                <CardDescription className="text-sm">
                  {'최근 검증 실행 내역 (행을 클릭하여 상세 결과 확인)'}
                </CardDescription>
              </div>
              <p className="text-xs text-muted-foreground">
                {'총 '}{verificationHistory.length}{'건'}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 text-xs"></TableHead>
                  <TableHead className="w-12 text-xs text-center">{'번호'}</TableHead>
                  <TableHead className="text-xs">DB</TableHead>
                  <TableHead className="text-xs">{'지표 유형'}</TableHead>
                  <TableHead className="text-xs">{'실행자'}</TableHead>
                  <TableHead className="text-xs">{'시작 일시'}</TableHead>
                  <TableHead className="text-xs">{'종료 일시'}</TableHead>
                  <TableHead className="text-xs">{'상태'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedHistory.map((row, index) => (
                  <Fragment key={row.id}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(row.id)}
                    >
                      <TableCell className="text-center">
                        {expandedRows.includes(row.id) ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-center text-xs font-medium text-muted-foreground">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell className="text-xs font-medium">{row.db}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline">{row.indicatorType}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          {row.executedBy}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {row.startedAt}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {row.endedAt ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {row.endedAt}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                    </TableRow>
                    
                    {/* Expanded Detail Row */}
                    {expandedRows.includes(row.id) && (
                      <TableRow key={`${row.id}-detail`} className="bg-muted/30">
                        <TableCell colSpan={8} className="p-4">
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground mb-2">{'검증 대상 데이터별 상세'}</p>
                            <div className="space-y-2">
                              {row.datasetDetails.map((dataset, idx) => (
                                <div key={idx} className="p-3 rounded-md border bg-background">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Badge variant="secondary" className="text-xs font-medium">{dataset.name}</Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {'쿼리 '}{dataset.queryCount}{'개'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="text-xs text-muted-foreground">
                                        <span>{'시작: '}</span>
                                        <span className="font-mono">{dataset.startedAt.split(' ')[1]}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        <span>{'종료: '}</span>
                                        <span className="font-mono">{dataset.endedAt ? dataset.endedAt.split(' ')[1] : '-'}</span>
                                      </div>
                                      {dataset.score !== null ? (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground">{'점수:'}</span>
                                          <span className={`text-sm font-bold ${getScoreColor(dataset.score)}`}>
                                            {dataset.score}
                                          </span>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-6 text-xs gap-1 ml-2"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              alert(`${dataset.name} 리포트 PDF 다운로드`)
                                            }}
                                          >
                                            <FileDown className="w-3 h-3" />
                                            {'PDF'}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-6 text-xs gap-1"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              window.location.href = `/dashboard/quality-results?id=${row.id}&dataset=${encodeURIComponent(dataset.name)}`
                                            }}
                                          >
                                            <ExternalLink className="w-3 h-3" />
                                            {'결과 보기'}
                                          </Button>
                                        </div>
                                      ) : dataset.progress ? (
                                        <Badge variant="default" className="text-xs">{dataset.progress}</Badge>
                                      ) : null}
                                      {dataset.error && (
                                        <Badge variant="destructive" className="text-xs">{dataset.error}</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-xs text-muted-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}{' - '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, verificationHistory.length)}
                  {' / '}{verificationHistory.length}{'건'}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    {'이전'}
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 w-7 text-xs p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    {'다음'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
