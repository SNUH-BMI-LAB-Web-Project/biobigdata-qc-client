'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { SearchInput } from '@/components/search-input'
import { indicatorsData, CATEGORIES } from '../_data'
import type { Indicator } from '../_data'

function getScoreColor(score: number, threshold: number) {
  if (score >= threshold + 3) return 'text-green-600'
  if (score >= threshold) return 'text-blue-600'
  if (score >= threshold - 5) return 'text-yellow-600'
  return 'text-red-600'
}

export function IndicatorsTab() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [indicators, setIndicators] = useState<Indicator[]>(indicatorsData)

  const handleToggleActive = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setIndicators(prev => prev.map(item =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    ))
  }, [])

  const filtered = useMemo(() =>
    indicators.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      return matchesSearch && matchesCategory
    }),
    [indicators, searchTerm, categoryFilter]
  )

  const totalPages = Math.ceil(filtered.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginated = filtered.slice(startIndex, startIndex + pageSize)

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="지표명 또는 설명 검색..."
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-3 text-sm border rounded-md bg-background"
              >
                <option value="all">전체 카테고리</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <Button size="sm" className="h-9 gap-1.5" onClick={() => alert('지표 적용 설정이 저장되었습니다.')}>
                <Save className="w-3.5 h-3.5" />
                적용
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        총 {indicators.length}개 품질지표 (활성: {indicators.filter(i => i.isActive).length}개)
      </p>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">페이지당 표시</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
                className="h-8 px-3 py-1 text-sm border rounded-md bg-background"
              >
                {[5, 10, 20].map(n => <option key={n} value={n}>{n}개</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(startIndex + pageSize, filtered.length)} / {filtered.length}개
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="h-7 px-2">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="h-7 px-2">
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
                <TableHead className="w-16 text-xs">적용</TableHead>
                <TableHead className="w-16 text-xs">ID</TableHead>
                <TableHead className="w-24 text-xs">카테고리</TableHead>
                <TableHead className="text-xs">지표명</TableHead>
                <TableHead className="text-xs">설명</TableHead>
                <TableHead className="w-20 text-center text-xs">가중치</TableHead>
                <TableHead className="w-20 text-center text-xs">기준값</TableHead>
                <TableHead className="w-24 text-center text-xs">진료DB</TableHead>
                <TableHead className="w-24 text-center text-xs">시험DB</TableHead>
                <TableHead className="w-28 text-xs">수정일</TableHead>
                <TableHead className="w-28 text-xs">적용일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(item => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/dashboard/indicators/${item.id}`)}
                >
                  <TableCell onClick={(e) => handleToggleActive(item.id, e)}>
                    <Checkbox checked={item.isActive} />
                  </TableCell>
                  <TableCell className="text-xs font-medium">{item.id}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{item.category}</Badge></TableCell>
                  <TableCell className="text-xs font-medium">{item.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.description}</TableCell>
                  <TableCell className="text-center text-xs">{item.weight}</TableCell>
                  <TableCell className="text-center text-xs font-medium">{item.threshold}</TableCell>
                  <TableCell className="text-center">
                    <span className={`text-sm font-bold ${getScoreColor(item.db1Score, item.threshold)}`}>{item.db1Score}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-sm font-bold ${getScoreColor(item.db2Score, item.threshold)}`}>{item.db2Score}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.lastModified}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.appliedDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
