'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SearchInput } from '@/components/search-input'
import { tablesData } from '../_data'

export function TablesTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [dbFilter, setDbFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const uniqueDbs = useMemo(
    () => Array.from(new Set(tablesData.map(t => t.db))),
    []
  )

  const filtered = useMemo(() =>
    tablesData.filter(table => {
      const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDb = dbFilter === 'all' || table.db === dbFilter
      return matchesSearch && matchesDb
    }),
    [searchTerm, dbFilter]
  )

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="테이블명 또는 설명 검색..."
            />
            <select
              value={dbFilter}
              onChange={(e) => setDbFilter(e.target.value)}
              className="h-9 px-3 text-sm border rounded-md bg-background flex-shrink-0"
            >
              <option value="all">전체 DB</option>
              {uniqueDbs.map(db => <option key={db} value={db}>{db}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 text-xs" />
                <TableHead className="text-xs">DB</TableHead>
                <TableHead className="text-xs">테이블명</TableHead>
                <TableHead className="text-xs">설명</TableHead>
                <TableHead className="w-28 text-center text-xs">레코드 수</TableHead>
                <TableHead className="w-24 text-center text-xs">컬럼 수</TableHead>
                <TableHead className="w-28 text-xs">최종 수정</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(table => (
                <>
                  <TableRow
                    key={table.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedId(expandedId === table.id ? null : table.id)}
                  >
                    <TableCell className="text-center">
                      {expandedId === table.id
                        ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      }
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{table.db.split(' ')[0]}</Badge></TableCell>
                    <TableCell className="text-sm font-mono font-medium">{table.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{table.description}</TableCell>
                    <TableCell className="text-center text-xs font-medium">{table.recordCount.toLocaleString()}</TableCell>
                    <TableCell className="text-center text-xs">{table.columnCount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{table.lastUpdated}</TableCell>
                  </TableRow>
                  {expandedId === table.id && (
                    <TableRow key={`${table.id}-cols`}>
                      <TableCell colSpan={7} className="p-0 bg-muted/20">
                        <div className="px-8 py-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            컬럼 목록 ({table.columns.length}개)
                          </p>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">컬럼명</TableHead>
                                <TableHead className="text-xs">타입</TableHead>
                                <TableHead className="w-20 text-center text-xs">NULL</TableHead>
                                <TableHead className="text-xs">설명</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {table.columns.map((col, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="text-xs font-mono font-medium">{col.name}</TableCell>
                                  <TableCell><Badge variant="secondary" className="text-xs font-mono">{col.type}</Badge></TableCell>
                                  <TableCell className="text-center text-xs">
                                    {col.nullable
                                      ? <span className="text-muted-foreground">O</span>
                                      : <span className="font-medium text-foreground">X</span>
                                    }
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
    </div>
  )
}
