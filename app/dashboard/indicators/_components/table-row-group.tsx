'use client'

import { memo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { FieldsPanel } from './fields-panel'
import { isY, requiredVariant, stageDbLabel } from './indicator-utils'
import type { DqTableResponse } from '@/lib/api'

export const TableRowGroup = memo(function TableRowGroup({
  table,
  expanded,
  onToggle,
}: {
  table: DqTableResponse
  expanded: boolean
  onToggle: () => void
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
          <Badge variant="outline" className="text-xs">
            {table.stage}
          </Badge>
        </TableCell>
        <TableCell className="text-left">
          <Badge variant={requiredVariant(table.tableRequired)} className="text-xs">
            {table.tableRequired}
          </Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground whitespace-normal break-words align-middle">
          {table.tableDescription}
        </TableCell>
        <TableCell className="text-left text-xs">
          {enabled ? (
            <span className="font-medium text-foreground">{'Y'}</span>
          ) : (
            <span className="text-muted-foreground">{'N'}</span>
          )}
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
