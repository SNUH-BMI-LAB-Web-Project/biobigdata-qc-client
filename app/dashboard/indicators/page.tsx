'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, ChevronLeft, ChevronRight, Save, ChevronDown, ChevronRight as ChevronRightIcon, Database, TableIcon, BarChart3 } from 'lucide-react'

// 지표 타입 정의
type Indicator = {
  id: number
  category: string
  name: string
  description: string
  db1Score: number
  db2Score: number
  weight: number
  threshold: number
  lastModified: string
  appliedDate: string
  isActive: boolean
}

// 테이블 타입 정의
type TableInfo = {
  id: number
  db: string
  name: string
  description: string
  recordCount: number
  columnCount: number
  lastUpdated: string
  columns: {
    name: string
    type: string
    nullable: boolean
    description: string
  }[]
}

// 테이블 목록 데이터
const tablesData: TableInfo[] = [
  {
    id: 1, db: '환자 진료 DB (KR-CDI)', name: 'patients', description: '환자 기본 정보 테이블',
    recordCount: 15234, columnCount: 12, lastUpdated: '2024-01-15',
    columns: [
      { name: 'patient_id', type: 'VARCHAR(20)', nullable: false, description: '환자 고유 ID' },
      { name: 'name', type: 'VARCHAR(100)', nullable: false, description: '환자 성명' },
      { name: 'birth_date', type: 'DATE', nullable: false, description: '생년월일' },
      { name: 'gender', type: 'CHAR(1)', nullable: false, description: '성별 (M/F)' },
      { name: 'email', type: 'VARCHAR(200)', nullable: true, description: '이메일 주소' },
      { name: 'phone', type: 'VARCHAR(20)', nullable: true, description: '연락처' },
      { name: 'address', type: 'VARCHAR(500)', nullable: true, description: '주소' },
      { name: 'insurance_type', type: 'VARCHAR(50)', nullable: true, description: '보험 유형' },
      { name: 'registered_date', type: 'DATETIME', nullable: false, description: '등록일' },
      { name: 'last_visit_date', type: 'DATETIME', nullable: true, description: '마지막 방문일' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, description: '상태 (활성/비활성)' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
  {
    id: 2, db: '환자 진료 DB (KR-CDI)', name: 'visits', description: '환자 방문 기록 테이블',
    recordCount: 48567, columnCount: 10, lastUpdated: '2024-01-15',
    columns: [
      { name: 'visit_id', type: 'VARCHAR(20)', nullable: false, description: '방문 고유 ID' },
      { name: 'patient_id', type: 'VARCHAR(20)', nullable: false, description: '환자 ID (FK)' },
      { name: 'visit_date', type: 'DATE', nullable: false, description: '방문 날짜' },
      { name: 'visit_type', type: 'VARCHAR(50)', nullable: false, description: '방문 유형 (외래/입원/응급)' },
      { name: 'department', type: 'VARCHAR(100)', nullable: false, description: '진료과' },
      { name: 'doctor_id', type: 'VARCHAR(20)', nullable: false, description: '담당의 ID' },
      { name: 'admission_time', type: 'DATETIME', nullable: true, description: '입원 시간' },
      { name: 'discharge_time', type: 'DATETIME', nullable: true, description: '퇴원 시간' },
      { name: 'diagnosis_code', type: 'VARCHAR(20)', nullable: true, description: '진단 코드' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
  {
    id: 3, db: '환자 진료 DB (KR-CDI)', name: 'medical_records', description: '진료 기록 테이블',
    recordCount: 125890, columnCount: 9, lastUpdated: '2024-01-14',
    columns: [
      { name: 'record_id', type: 'VARCHAR(20)', nullable: false, description: '기록 고유 ID' },
      { name: 'visit_id', type: 'VARCHAR(20)', nullable: false, description: '방문 ID (FK)' },
      { name: 'patient_id', type: 'VARCHAR(20)', nullable: false, description: '환자 ID (FK)' },
      { name: 'diagnosis', type: 'TEXT', nullable: false, description: '진단 내용' },
      { name: 'treatment', type: 'TEXT', nullable: true, description: '치료 내용' },
      { name: 'prescription', type: 'TEXT', nullable: true, description: '처방 내용' },
      { name: 'notes', type: 'TEXT', nullable: true, description: '비고' },
      { name: 'record_date', type: 'DATETIME', nullable: false, description: '기록 일시' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
  {
    id: 4, db: '환자 진료 DB (KR-CDI)', name: 'lab_results', description: '검사 결과 테이블',
    recordCount: 89450, columnCount: 8, lastUpdated: '2024-01-15',
    columns: [
      { name: 'lab_id', type: 'VARCHAR(20)', nullable: false, description: '검사 고유 ID' },
      { name: 'patient_id', type: 'VARCHAR(20)', nullable: false, description: '환자 ID (FK)' },
      { name: 'test_name', type: 'VARCHAR(200)', nullable: false, description: '검사명' },
      { name: 'test_code', type: 'VARCHAR(50)', nullable: false, description: '검사 코드' },
      { name: 'result_value', type: 'VARCHAR(100)', nullable: true, description: '결과값' },
      { name: 'unit', type: 'VARCHAR(50)', nullable: true, description: '단위' },
      { name: 'test_date', type: 'DATETIME', nullable: false, description: '검사 일시' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
  {
    id: 5, db: '임상시험 DB (통합 DB)', name: 'subjects', description: '임상시험 참여자 테이블',
    recordCount: 3456, columnCount: 10, lastUpdated: '2024-01-15',
    columns: [
      { name: 'subject_id', type: 'VARCHAR(20)', nullable: false, description: '참여자 고유 ID' },
      { name: 'enrollment_date', type: 'DATE', nullable: false, description: '등록일' },
      { name: 'trial_id', type: 'VARCHAR(20)', nullable: false, description: '시험 ID (FK)' },
      { name: 'site_id', type: 'VARCHAR(20)', nullable: false, description: '기관 ID' },
      { name: 'age', type: 'INT', nullable: false, description: '나이' },
      { name: 'gender', type: 'CHAR(1)', nullable: false, description: '성별' },
      { name: 'consent_date', type: 'DATE', nullable: false, description: '동의서 날짜' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, description: '참여 상태' },
      { name: 'contact_info', type: 'VARCHAR(200)', nullable: true, description: '연락처' },
      { name: 'medical_history', type: 'TEXT', nullable: true, description: '병력' },
    ],
  },
  {
    id: 6, db: '임상시험 DB (통합 DB)', name: 'trial_data', description: '시험 데이터 테이블',
    recordCount: 45678, columnCount: 8, lastUpdated: '2024-01-14',
    columns: [
      { name: 'data_id', type: 'VARCHAR(20)', nullable: false, description: '데이터 고유 ID' },
      { name: 'trial_id', type: 'VARCHAR(20)', nullable: false, description: '시험 ID (FK)' },
      { name: 'subject_id', type: 'VARCHAR(20)', nullable: false, description: '참여자 ID (FK)' },
      { name: 'visit_number', type: 'INT', nullable: false, description: '방문 차수' },
      { name: 'outcome', type: 'TEXT', nullable: true, description: '결과' },
      { name: 'adverse_event', type: 'TEXT', nullable: true, description: '이상 반응' },
      { name: 'notes', type: 'TEXT', nullable: true, description: '비고' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
  {
    id: 7, db: '임상시험 DB (통합 DB)', name: 'trial_visits', description: '시험 방문 기록 테이블',
    recordCount: 12890, columnCount: 7, lastUpdated: '2024-01-15',
    columns: [
      { name: 'visit_id', type: 'VARCHAR(20)', nullable: false, description: '방문 고유 ID' },
      { name: 'subject_id', type: 'VARCHAR(20)', nullable: false, description: '참여자 ID (FK)' },
      { name: 'visit_date', type: 'DATE', nullable: false, description: '방문 날짜' },
      { name: 'visit_type', type: 'VARCHAR(50)', nullable: false, description: '방문 유형' },
      { name: 'start_time', type: 'DATETIME', nullable: true, description: '시작 시간' },
      { name: 'end_time', type: 'DATETIME', nullable: true, description: '종료 시간' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
  {
    id: 8, db: '임상시험 DB (통합 DB)', name: 'trial_measurements', description: '시험 측정 데이터 테이블',
    recordCount: 67890, columnCount: 9, lastUpdated: '2024-01-13',
    columns: [
      { name: 'measurement_id', type: 'VARCHAR(20)', nullable: false, description: '측정 고유 ID' },
      { name: 'subject_id', type: 'VARCHAR(20)', nullable: false, description: '참여자 ID (FK)' },
      { name: 'visit_id', type: 'VARCHAR(20)', nullable: false, description: '방문 ID (FK)' },
      { name: 'test_name', type: 'VARCHAR(200)', nullable: false, description: '검사명' },
      { name: 'test_code', type: 'VARCHAR(50)', nullable: false, description: '검사 코드' },
      { name: 'result_value', type: 'VARCHAR(100)', nullable: true, description: '결과값' },
      { name: 'unit', type: 'VARCHAR(50)', nullable: true, description: '단위' },
      { name: 'test_date', type: 'DATETIME', nullable: false, description: '검사 일시' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
]

// 27개 지표 데이터
const indicatorsData: Indicator[] = Array.from({ length: 27 }, (_, i) => {
  const categoryIndex = Math.floor(i / 9)
  const categories = ['완전성', '정확성', '일관성']
  const scores = [
    [98.5, 94.5], [94.2, 89.2], [97.8, 93.8], [95.6, 91.6], [96.3, 92.3],
    [93.7, 88.7], [97.1, 94.1], [95.2, 90.2], [94.8, 89.8],
    [92.3, 87.3], [96.7, 93.7], [94.5, 89.5], [91.8, 86.8], [95.9, 91.9],
    [93.4, 88.4], [97.6, 94.6], [94.1, 89.1], [92.7, 87.7],
    [96.2, 92.2], [93.9, 88.9], [95.4, 90.4], [94.6, 89.6], [92.1, 87.1],
    [97.3, 93.3], [95.8, 91.8], [93.2, 88.2], [96.5, 92.5]
  ]
  
  return {
    id: i + 1,
    category: categories[categoryIndex],
    name: `${categories[categoryIndex]} 지표 ${(i % 9) + 1}`,
    description: `${categories[categoryIndex]} 관련 품질 검증 지표입니다`,
    db1Score: scores[i][0],
    db2Score: scores[i][1],
    weight: 8 + (i % 3),
    threshold: 90 + (i % 6),
    lastModified: `2024-01-${15 - (i % 15)}`,
    appliedDate: `2024-01-${10 - (i % 10)}`,
    isActive: i % 5 !== 0,
  }
})

export default function IndicatorsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'tables' | 'indicators' | 'stats'>('tables')
  const [tableSearchTerm, setTableSearchTerm] = useState('')
  const [tableDbFilter, setTableDbFilter] = useState<string>('all')
  const [expandedTableId, setExpandedTableId] = useState<number | null>(null)

  // Indicator list state
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [indicators, setIndicators] = useState<Indicator[]>(indicatorsData)

  const categories = ['완전성', '정확성', '일관성']
  const uniqueDbs = Array.from(new Set(tablesData.map(t => t.db)))

  const handleIndicatorClick = (indicatorId: number) => {
    router.push(`/dashboard/indicators/${indicatorId}`)
  }

  const handleToggleActive = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setIndicators(prev => prev.map(item => 
      item.id === id ? { ...item, isActive: !item.isActive } : item
    ))
  }

  // Table filtering
  const filteredTables = tablesData.filter((table) => {
    const matchesSearch = table.name.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
                          table.description.toLowerCase().includes(tableSearchTerm.toLowerCase())
    const matchesDb = tableDbFilter === 'all' || table.db === tableDbFilter
    return matchesSearch && matchesDb
  })

  // Indicator filtering
  const filteredData = indicators.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const getScoreColor = (score: number, threshold: number) => {
    if (score >= threshold + 3) return 'text-green-600'
    if (score >= threshold) return 'text-blue-600'
    if (score >= threshold - 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">{'지표DB 관리'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {'테이블 및 품질 지표 관리'}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tables">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="tables" className="gap-1 sm:gap-1.5 text-xs sm:text-sm truncate">
              <Database className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{'테이블 목록'}</span>
            </TabsTrigger>
            <TabsTrigger value="indicators" className="gap-1 sm:gap-1.5 text-xs sm:text-sm truncate">
              <TableIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{'지표 목록'}</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1 sm:gap-1.5 text-xs sm:text-sm truncate">
              <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{'통계 목록'}</span>
            </TabsTrigger>
          </TabsList>

          {/* Tables Tab */}
          <TabsContent value="tables" className="space-y-4 mt-4">
            {/* Search and Filter */}
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="테이블명 또는 설명 검색..."
                      value={tableSearchTerm}
                      onChange={(e) => setTableSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={tableDbFilter}
                    onChange={(e) => setTableDbFilter(e.target.value)}
                    className="h-9 px-3 text-sm border rounded-md bg-background flex-shrink-0"
                  >
                    <option value="all">{'전체 DB'}</option>
                    {uniqueDbs.map((db) => (
                      <option key={db} value={db}>{db}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Table List */}
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8 text-xs"></TableHead>
                      <TableHead className="text-xs">DB</TableHead>
                      <TableHead className="text-xs">{'테이블명'}</TableHead>
                      <TableHead className="text-xs">{'설명'}</TableHead>
                      <TableHead className="w-28 text-center text-xs">{'레코드 수'}</TableHead>
                      <TableHead className="w-24 text-center text-xs">{'컬럼 수'}</TableHead>
                      <TableHead className="w-28 text-xs">{'최종 수정'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTables.map((table) => (
                      <>
                        <TableRow
                          key={table.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setExpandedTableId(expandedTableId === table.id ? null : table.id)}
                        >
                          <TableCell className="text-center">
                            {expandedTableId === table.id ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{table.db.split(' ')[0]}</Badge>
                          </TableCell>
                          <TableCell className="text-sm font-mono font-medium">{table.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{table.description}</TableCell>
                          <TableCell className="text-center text-xs font-medium">{table.recordCount.toLocaleString()}</TableCell>
                          <TableCell className="text-center text-xs">{table.columnCount}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{table.lastUpdated}</TableCell>
                        </TableRow>

                        {/* Expanded Column Details */}
                        {expandedTableId === table.id && (
                          <TableRow key={`${table.id}-columns`}>
                            <TableCell colSpan={7} className="p-0 bg-muted/20">
                              <div className="px-8 py-3">
                                <p className="text-xs font-semibold text-muted-foreground mb-2">
                                  {'컬럼 목록 ('}{table.columns.length}{'개)'}
                                </p>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="text-xs">{'컬럼명'}</TableHead>
                                      <TableHead className="text-xs">{'타입'}</TableHead>
                                      <TableHead className="w-20 text-center text-xs">{'NULL'}</TableHead>
                                      <TableHead className="text-xs">{'설명'}</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {table.columns.map((col, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell className="text-xs font-mono font-medium">{col.name}</TableCell>
                                        <TableCell>
                                          <Badge variant="secondary" className="text-xs font-mono">
                                            {col.type}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-xs">
                                          {col.nullable ? (
                                            <span className="text-muted-foreground">{'O'}</span>
                                          ) : (
                                            <span className="font-medium text-foreground">{'X'}</span>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{col.description}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Indicators Tab */}
          <TabsContent value="indicators" className="space-y-4 mt-4">
            {/* Search and Filters */}
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="지표명 또는 설명 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-9 px-3 text-sm border rounded-md bg-background"
                    >
                      <option value="all">{'전체 카테고리'}</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <Button 
                      size="sm" 
                      className="h-9 gap-1.5"
                      onClick={() => alert('지표 적용 설정이 저장되었습니다.')}
                    >
                      <Save className="w-3.5 h-3.5" />
                      {'적용'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Count */}
            <p className="text-sm text-muted-foreground">
              {'총 '}{indicators.length}{'개 품질지표 (활성: '}{indicators.filter(i => i.isActive).length}{'개)'}
            </p>

            {/* Table */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{'페이지당 표시'}</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="h-8 px-3 py-1 text-sm border rounded-md bg-background"
                    >
                      <option value={5}>{'5개'}</option>
                      <option value={10}>{'10개'}</option>
                      <option value={20}>{'20개'}</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {startIndex + 1}-{Math.min(endIndex, filteredData.length)} / {filteredData.length}{'개'}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-7 px-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-7 px-2"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-xs">{'적용'}</TableHead>
                      <TableHead className="w-16 text-xs">ID</TableHead>
                      <TableHead className="w-24 text-xs">{'카테고리'}</TableHead>
                      <TableHead className="text-xs">{'지표명'}</TableHead>
                      <TableHead className="text-xs">{'설명'}</TableHead>
                      <TableHead className="w-20 text-center text-xs">{'가중치'}</TableHead>
                      <TableHead className="w-20 text-center text-xs">{'기준값'}</TableHead>
                      <TableHead className="w-24 text-center text-xs">{'진료DB'}</TableHead>
                      <TableHead className="w-24 text-center text-xs">{'시험DB'}</TableHead>
                      <TableHead className="w-28 text-xs">{'수정일'}</TableHead>
                      <TableHead className="w-28 text-xs">{'적용일'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleIndicatorClick(item.id)}
                      >
                        <TableCell onClick={(e) => handleToggleActive(item.id, e)}>
                          <Checkbox checked={item.isActive} />
                        </TableCell>
                        <TableCell className="text-xs font-medium">{item.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{item.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-center text-xs">{item.weight}</TableCell>
                        <TableCell className="text-center text-xs font-medium">
                          {item.threshold}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`text-sm font-bold ${getScoreColor(item.db1Score, item.threshold)}`}
                          >
                            {item.db1Score}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`text-sm font-bold ${getScoreColor(item.db2Score, item.threshold)}`}
                          >
                            {item.db2Score}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.lastModified}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.appliedDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-xs">ID</TableHead>
                      <TableHead className="text-xs">{'통계 지표명'}</TableHead>
                      <TableHead className="text-xs">{'설명'}</TableHead>
                      <TableHead className="text-xs">{'산출 주기'}</TableHead>
                      <TableHead className="w-28 text-xs">{'마지막 산출'}</TableHead>
                      <TableHead className="w-24 text-xs">{'상태'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: 1, name: '일별 환자 수', desc: '일자별 신규 및 재진 환자 수', period: '매일', lastRun: '2024-01-15', status: '정상' },
                      { id: 2, name: '진료과별 방문 현황', desc: '진료과별 일일 방문 환자 수', period: '매일', lastRun: '2024-01-15', status: '정상' },
                      { id: 3, name: '월별 진단 분포', desc: '주요 진단 코드별 월간 분포', period: '매월', lastRun: '2024-01-01', status: '정상' },
                      { id: 4, name: '검사 항목별 통계', desc: '검사 종류별 수행 건수 및 이상치', period: '매주', lastRun: '2024-01-14', status: '경고' },
                      { id: 5, name: '임상시험 등록 현황', desc: '시험별 참여자 등록 추이', period: '매일', lastRun: '2024-01-15', status: '정상' },
                      { id: 6, name: '이상반응 발생률', desc: '임상시험별 이상반응 발생 통계', period: '매주', lastRun: '2024-01-14', status: '정상' },
                      { id: 7, name: '약물 처방 현황', desc: '의약품 처방 빈도 및 용량 분포', period: '매일', lastRun: '2024-01-15', status: '정상' },
                      { id: 8, name: '입퇴원 통계', desc: '일별 입원/퇴원 환자 수', period: '매일', lastRun: '2024-01-15', status: '정상' },
                    ].map((stat) => (
                      <TableRow key={stat.id} className="hover:bg-muted/50 cursor-pointer">
                        <TableCell className="text-xs font-medium">{stat.id}</TableCell>
                        <TableCell className="text-xs font-medium">{stat.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{stat.desc}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline">{stat.period}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{stat.lastRun}</TableCell>
                        <TableCell className="text-xs">
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
