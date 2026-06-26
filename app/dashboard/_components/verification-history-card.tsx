'use client'

import { Fragment } from 'react'
import { ChevronDown, ChevronRight, Clock, ExternalLink, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { STAGE_LABEL, SUB_STAGE_LABEL, checkTypeLabel } from '@/lib/api'
import { AsyncStateBlock, RefreshingContent } from '@/components/async-state'
import { CheckStatusBadge } from '@/components/check-status-badge'
import { ExecutionDetailRow } from './execution-detail-row'
import { CompactPager } from '@/components/pager'
import { EXECUTIONS_PAGE_SIZE } from './verification-config'
import type { CheckExecutionResponse } from '@/lib/api'

interface VerificationHistoryCardProps {
  rows: CheckExecutionResponse[]
  totalCount: number
  page: number
  totalPages: number
  expandedRows: number[]
  loading: boolean
  refetching: boolean
  error: string | null
  onPageChange: (page: number) => void
  onRetry: () => void
  onToggleRow: (checkId: number) => void
}

export function VerificationHistoryCard({
  rows,
  totalCount,
  page,
  totalPages,
  expandedRows,
  loading,
  refetching,
  error,
  onPageChange,
  onRetry,
  onToggleRow,
}: VerificationHistoryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{'검증 현황'}</CardTitle>
              <span className="text-xs text-muted-foreground">
                {'총 '}
                {totalCount}
                {'건'}
              </span>
            </div>
            <CardDescription className="text-sm">
              {'최근 검증 실행 내역 (행을 클릭하여 상세 결과 확인)'}
            </CardDescription>
          </div>
          <CompactPager page={page} totalPages={totalPages} onChange={onPageChange} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <AsyncStateBlock
            loading={loading}
            error={error}
            empty={!loading && !error}
            emptyMessage="검증 실행 내역이 없습니다."
            onRetry={onRetry}
          />
        ) : (
          <RefreshingContent isRefetching={refetching}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 text-xs" />
                  <TableHead className="w-12 text-xs text-center">{'번호'}</TableHead>
                  <TableHead className="w-28 text-xs">{'DB'}</TableHead>
                  <TableHead className="w-[260px] text-xs">{'데이터'}</TableHead>
                  <TableHead className="w-28 text-xs">{'지표 유형'}</TableHead>
                  <TableHead className="w-28 text-xs">{'실행자'}</TableHead>
                  <TableHead className="w-44 text-xs">{'시작 일시'}</TableHead>
                  <TableHead className="w-44 text-xs">{'종료 일시'}</TableHead>
                  <TableHead className="w-20 text-xs">{'상태'}</TableHead>
                  <TableHead className="w-28 text-right text-xs">{'결과'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <Fragment key={row.checkId}>
                    <ExecutionRow
                      row={row}
                      rowNumber={row.checkId}
                      expanded={expandedRows.includes(row.checkId)}
                      onToggle={() => onToggleRow(row.checkId)}
                    />
                    {expandedRows.includes(row.checkId) && (
                      <TableRow key={`${row.checkId}-detail`} className="bg-muted/30">
                        <TableCell colSpan={10} className="p-4">
                          <ExecutionDetailRow checkId={row.checkId} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </RefreshingContent>
        )}
      </CardContent>
    </Card>
  )
}

function ExecutionRow({
  row,
  rowNumber,
  expanded,
  onToggle,
}: {
  row: CheckExecutionResponse
  rowNumber: number
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onToggle}>
      <TableCell className="text-center">
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </TableCell>
      <TableCell className="text-center text-xs font-medium text-muted-foreground">
        {rowNumber}
      </TableCell>
      <TableCell className="text-xs font-medium">{STAGE_LABEL[row.stage] ?? row.stage}</TableCell>
      <TableCell className="text-xs whitespace-normal break-words">
        {SUB_STAGE_LABEL[row.subStage] ?? (row.subStage || '-')}
      </TableCell>
      <TableCell className="text-xs">
        <Badge variant="outline">{checkTypeLabel(row.checkType)}</Badge>
      </TableCell>
      <TableCell className="text-xs">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3 text-muted-foreground" />
          {row.checkStatusFstWrt || '-'}
        </div>
      </TableCell>
      <TableCell className="text-xs">
        <DateCell value={row.checkStartDatetime} />
      </TableCell>
      <TableCell className="text-xs">
        {row.checkEndDatetime ? <DateCell value={row.checkEndDatetime} /> : <span className="text-muted-foreground">-</span>}
      </TableCell>
      <TableCell>
        <CheckStatusBadge status={row.checkStatus} />
      </TableCell>
      <TableCell className="text-right">
        {row.checkStatus === 1 && (
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs gap-1"
            onClick={(e) => {
              e.stopPropagation()
              window.location.href = `/dashboard/quality-results?checkId=${row.checkId}`
            }}
          >
            <ExternalLink className="w-3 h-3" />
            {'결과 보기'}
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

function DateCell({ value }: { value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-1">
      <Clock className="w-3 h-3 text-muted-foreground" />
      {value || '-'}
    </div>
  )
}
