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

// 임시 데이터 (실제로는 API — dq_quality_metric ⨝ dq_field_check 등에서 가져올 데이터)
//   ※ 점수는 dq_quality_results 기반 단계별 DB(연계DB/전처리DB) 통과율 (§2.2 파이프라인)
const metricSeed: Record<number, {
  metricId: string; version: string; category: string; checkLevel: string
  name: string; description: string; link: number; prep: number; threshold: number
  lastModified: string; appliedDate: string
  appliedTables: { table: string; columns: string[]; isActive: boolean; lastModified: string }[]
}> = {
  1: { metricId: 'QM001', version: 'v1.3', category: '완전성', checkLevel: '컬럼', name: '환자 필수항목 결측 검증', description: 'BIKO_INFO_PATIENT 환자ID/성별/생년월일 결측 검사', link: 99.2, prep: 99.6, threshold: 99, lastModified: '2026-05-11', appliedDate: '2026-05-12',
    appliedTables: [
      { table: 'BIKO_INFO_PATIENT', columns: ['PATIENT_ID', 'GENDER', 'BIRTH_DATE'], isActive: true, lastModified: '2026-05-11' },
    ] },
  3: { metricId: 'QM003', version: 'v1.1', category: '정합성', checkLevel: '컬럼', name: '진단코드 표준 적합성', description: 'BIKO_CARE_CONDITION 진단코드 KCD 표준 코드 적합 여부', link: 95.6, prep: 96.9, threshold: 95, lastModified: '2026-04-27', appliedDate: '2026-04-28',
    appliedTables: [
      { table: 'BIKO_CARE_CONDITION', columns: ['DIAGNOSIS_CD', 'DIAGNOSIS_TYPE'], isActive: true, lastModified: '2026-04-27' },
    ] },
  5: { metricId: 'QM005', version: 'v1.2', category: '타당성', checkLevel: '컨셉', name: '진단 없는 약물 처방 검출', description: '고혈압 진단 없이 고혈압 약물이 처방된 케이스 검출', link: 88.4, prep: 90.2, threshold: 90, lastModified: '2026-05-03', appliedDate: '2026-05-04',
    appliedTables: [
      { table: 'BIKO_CARE_MEDICATION', columns: ['DRUG_CD', 'PATIENT_ID'], isActive: true, lastModified: '2026-05-03' },
      { table: 'BIKO_CARE_CONDITION', columns: ['DIAGNOSIS_CD', 'PATIENT_ID'], isActive: true, lastModified: '2026-05-03' },
    ] },
}

const getIndicatorData = (id: string) => {
  const numId = parseInt(id)
  const seed = metricSeed[numId] ?? {
    metricId: `QM${String(numId).padStart(3, '0')}`, version: 'v1.0', category: '완전성', checkLevel: '컬럼',
    name: '품질 지표', description: 'BIKO_Data_Quality_DB 품질 검증 지표', link: 96.5, prep: 97.2, threshold: 95,
    lastModified: '2026-05-12', appliedDate: '2026-05-12',
    appliedTables: [
      { table: 'BIKO_INFO_PATIENT', columns: ['PATIENT_ID', 'GENDER'], isActive: true, lastModified: '2026-05-12' },
      { table: 'BIKO_INFO_ENCOUNTER', columns: ['ENCOUNTER_ID', 'PATIENT_ID'], isActive: true, lastModified: '2026-05-12' },
    ],
  }

  return {
    id: numId,
    metricId: seed.metricId,
    version: seed.version,
    category: seed.category,
    checkLevel: seed.checkLevel,
    name: seed.name,
    description: seed.description,
    linkScore: seed.link,
    prepScore: seed.prep,
    threshold: seed.threshold,
    lastModified: seed.lastModified,
    appliedDate: seed.appliedDate,
    appliedTables: seed.appliedTables.map((t) => ({ db: 'BIKO_Data_Quality_DB', ...t })),
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
                <CardTitle className="text-xl">
                  <span className="font-mono text-base text-muted-foreground mr-2">{indicator.metricId}</span>
                  {indicator.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <Badge variant="outline">{indicator.category}</Badge>
                  <Badge variant="secondary">{indicator.checkLevel}</Badge>
                  <span>버전: {indicator.version}</span>
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
              <CardTitle className="text-sm">최근 검증 통과율</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">연계DB (LINK · QC1):</span>
                <span className={`font-bold ${getScoreColor(indicator.linkScore, indicator.threshold)}`}>
                  {indicator.linkScore.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">전처리DB (PREP · QC2/3):</span>
                <span className={`font-bold ${getScoreColor(indicator.prepScore, indicator.threshold)}`}>
                  {indicator.prepScore.toFixed(1)}
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
