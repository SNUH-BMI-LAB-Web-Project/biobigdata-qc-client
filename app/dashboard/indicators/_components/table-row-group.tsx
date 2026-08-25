'use client'

import { memo } from 'react'
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import { ActiveToggleCell } from './active-toggle-cell'
import { FieldsPanel } from './fields-panel'
import { isY, requiredVariant, stageDbLabel } from './indicator-utils'
import type { DqTableResponse } from '@/lib/api'

export const TableRowGroup = memo(function TableRowGroup({
  table,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  table: DqTableResponse
  expanded: boolean
  onToggle: () => void
  onEdit: (table: DqTableResponse) => void
  onDelete: (table: DqTableResponse) => void
}) {
  const enabled = isY(table.isEnable)

  return (
    <>
      <TableRow
        className={`cursor-pointer hover:bg-muted/50 ${!enabled ? 'opacity-50' : ''}`}
        onClick={onToggle}
      >
        <TableCell className="text-center">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell className="text-left">
          <Badge variant="secondary" className="text-xs">
            {stageDbLabel(table.stage)}
          </Badge>
        </TableCell>
        <TableCell className="text-xs font-mono text-muted-foreground whitespace-normal break-all align-top">
          {table.tableId}
        </TableCell>
        <TableCell
          className="text-sm font-mono font-medium whitespace-normal break-all align-top"
          title={table.tableName}
        >
          {table.tableName}
        </TableCell>
        <TableCell className="text-left">
          <Badge
            variant={requiredVariant(table.tableRequired)}
            className="text-xs"
          >
            {table.tableRequired}
          </Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground whitespace-normal break-words align-middle">
          {table.tableDescription}
        </TableCell>
        <TableCell className="text-left">
          <ActiveToggleCell
            active={enabled}
            label={`테이블 ${table.tableName}`}
            onSave={async (next) => {
              await unwrapGeneratedResult(
                await generatedApi.PATCH(
                  '/api/qc/tables/{tableId}/activation',
                  {
                    params: { path: { tableId: table.tableId } },
                    body: { isActive: next ? 'Y' : 'N' },
                  },
                ),
              )
            }}
          />
        </TableCell>
        {/* 행 전체가 펼침 토글이므로 버튼 클릭이 행으로 번지지 않게 막는다 */}
        <TableCell
          className="text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              aria-label="테이블 수정"
              title="수정"
              onClick={() => onEdit(table)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive"
              aria-label="테이블 삭제"
              title="삭제"
              onClick={() => onDelete(table)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={8} className="p-0 bg-muted/20">
            <FieldsPanel tableId={table.tableId} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
})
