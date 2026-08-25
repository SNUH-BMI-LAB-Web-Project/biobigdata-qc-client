'use client'

import { useCallback, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import { useDebounced } from '@/hooks/use-debounced'
import { ApiError, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import { RefreshingContent, TableStateRow } from '@/components/async-state'
import { TablePagerHeader } from '@/components/pager'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { TableFormDialog } from './table-form-dialog'
import { RequiredInfoTooltip } from './required-info-tooltip'
import { TableRowGroup } from './table-row-group'
import { ColumnFilterHeader } from './column-filter-header'
import { STAGE_FILTER_OPTIONS } from './indicator-utils'
import type { DqTableResponse, PageResult } from '@/lib/api'

export function TablesTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showDisabled, setShowDisabled] = useState(false)
  const [stageFilter, setStageFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DqTableResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DqTableResponse | null>(null)
  const [deleting, setDeleting] = useState(false)
  const keyword = useDebounced(searchTerm)

  const { data, isInitialLoading, isRefetching, error, refetch } = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<DqTableResponse>>(
        await generatedApi.GET('/api/qc/tables', {
          params: {
            query: {
              keyword: keyword || undefined,
              stage: stageFilter === 'all' ? undefined : stageFilter,
              includeDisabled: showDisabled,
              page,
              size: pageSize,
            },
          },
          signal,
        }),
      ),
    [keyword, stageFilter, showDisabled, page, pageSize],
  )

  const tables = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  const resetList = () => {
    setPage(1)
    setExpandedTableId(null)
  }

  // memo 된 TableRowGroup 에 안정된 참조를 넘긴다
  const handleEdit = useCallback((t: DqTableResponse) => setEditTarget(t), [])
  const handleDelete = useCallback(
    (t: DqTableResponse) => setDeleteTarget(t),
    [],
  )

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await unwrapGeneratedResult(
        await generatedApi.DELETE('/api/qc/tables/{tableId}', {
          params: { path: { tableId: deleteTarget.tableId } },
        }),
      )
      if (expandedTableId === deleteTarget.tableId) setExpandedTableId(null)
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      alert(
        err instanceof ApiError ? err.message : '테이블 삭제에 실패했습니다.',
      )
    } finally {
      setDeleting(false)
    }
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
        <Button
          className="gap-1.5 whitespace-nowrap"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="w-4 h-4" />
          {'테이블 추가'}
        </Button>
      </div>

      <TableFormDialog
        // 대상이 바뀌면 remount 시켜 폼을 새 값으로 초기화한다
        key={editTarget?.tableId ?? 'new'}
        open={addOpen || editTarget !== null}
        onOpenChange={(next) => {
          if (next) return
          setAddOpen(false)
          setEditTarget(null)
        }}
        table={editTarget}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null)
        }}
        title="테이블 삭제"
        description={
          <>
            <b className="text-foreground font-mono">
              {deleteTarget?.tableName}
            </b>
            {' 테이블을 삭제하면 목록에서 제외됩니다. 계속하시겠습니까?'}
          </>
        }
        confirmLabel="삭제"
        pendingLabel="삭제 중..."
        destructive
        pending={deleting}
        onConfirm={confirmDelete}
      />

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
                  <TableHead className="w-20 px-1 text-xs">
                    <ColumnFilterHeader
                      label="DB"
                      allLabel="전체 DB"
                      value={stageFilter}
                      onChange={(value) => {
                        setStageFilter(value)
                        resetList()
                      }}
                      options={STAGE_FILTER_OPTIONS}
                    />
                  </TableHead>
                  <TableHead className="w-28 whitespace-normal break-words text-xs">
                    {'테이블ID'}
                  </TableHead>
                  <TableHead className="w-[380px] whitespace-normal break-words text-xs">
                    {'테이블명'}
                  </TableHead>
                  <TableHead className="w-24 text-xs">
                    <span className="inline-flex items-center gap-1">
                      {'필수여부'}
                      <RequiredInfoTooltip />
                    </span>
                  </TableHead>
                  <TableHead className="w-[360px] whitespace-normal break-words text-xs">
                    {'설명'}
                  </TableHead>
                  <TableHead className="w-32 truncate whitespace-nowrap text-xs">
                    {'활성/비활성'}
                  </TableHead>
                  <TableHead className="w-20 text-xs">{'관리'}</TableHead>
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
                        setExpandedTableId(
                          expandedTableId === table.tableId
                            ? null
                            : table.tableId,
                        )
                      }
                      onEdit={handleEdit}
                      onDelete={handleDelete}
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
