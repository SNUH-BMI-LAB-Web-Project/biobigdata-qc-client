'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import { useDebounced } from '@/hooks/use-debounced'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import { RefreshingContent, TableStateRow } from '@/components/async-state'
import { TablePagerHeader } from '@/components/pager'
import { AddTableDialog } from './add-table-dialog'
import { RequiredInfoTooltip } from './required-info-tooltip'
import { TableRowGroup } from './table-row-group'
import type { DqTableResponse, PageResult } from '@/lib/api'

export function TablesTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showDisabled, setShowDisabled] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const keyword = useDebounced(searchTerm)

  const { data, isInitialLoading, isRefetching, error, refetch } = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<DqTableResponse>>(
        await generatedApi.GET('/api/qc/tables', {
          params: {
            query: {
              keyword: keyword || undefined,
              includeDisabled: showDisabled,
              page,
              size: pageSize,
            },
          },
          signal,
        }),
      ),
    [keyword, showDisabled, page, pageSize],
  )

  const tables = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  const resetList = () => {
    setPage(1)
    setExpandedTableId(null)
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="테이블명, 설명 또는 테이블ID 검색..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              resetList()
            }}
            className="pl-10"
          />
        </div>
        <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
          <Checkbox
            checked={showDisabled}
            onCheckedChange={(value) => {
              setShowDisabled(!!value)
              resetList()
            }}
          />
          {'미사용 포함'}
        </label>
        <Button className="gap-1.5 whitespace-nowrap" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" />
          {'테이블 추가'}
        </Button>
      </div>

      <AddTableDialog open={addOpen} onOpenChange={setAddOpen} onCreated={refetch} />

      <Card>
        <TablePagerHeader
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          totalLabel={`총 ${totalCount}개 테이블`}
          onChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            resetList()
          }}
        />
        <CardContent className="p-0">
          <RefreshingContent isRefetching={isRefetching}>
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 text-xs" />
                  <TableHead className="w-20 text-xs">{'DB'}</TableHead>
                  <TableHead className="w-28 whitespace-normal break-words text-xs">{'테이블ID'}</TableHead>
                  <TableHead className="w-[380px] whitespace-normal break-words text-xs">{'테이블명'}</TableHead>
                  <TableHead className="w-20 text-xs">{'단계'}</TableHead>
                  <TableHead className="w-24 text-xs">
                    <span className="inline-flex items-center gap-1">
                      {'필수여부'}
                      <RequiredInfoTooltip />
                    </span>
                  </TableHead>
                  <TableHead className="w-[360px] whitespace-normal break-words text-xs">{'설명'}</TableHead>
                  <TableHead className="w-16 text-xs">{'사용'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.length === 0 ? (
                  <TableStateRow
                    colSpan={8}
                    loading={isInitialLoading}
                    error={error}
                    empty={!isInitialLoading && !error}
                    onRetry={refetch}
                  />
                ) : (
                  tables.map((table) => (
                    <TableRowGroup
                      key={table.tableId}
                      table={table}
                      expanded={expandedTableId === table.tableId}
                      onToggle={() =>
                        setExpandedTableId(expandedTableId === table.tableId ? null : table.tableId)
                      }
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </RefreshingContent>
        </CardContent>
      </Card>
    </div>
  )
}
