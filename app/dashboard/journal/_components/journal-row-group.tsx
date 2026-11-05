'use client'

import { memo } from 'react'
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import type { DqResultReview } from '@/lib/api'
import { ActionsPanel } from './actions-panel'
import { shortDatetime } from './journal-utils'

export const JournalRowGroup = memo(function JournalRowGroup({
  review,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  review: DqResultReview
  expanded: boolean
  onToggle: () => void
  onEdit: (review: DqResultReview) => void
  onDelete: (review: DqResultReview) => void
}) {
  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onToggle}>
        <TableCell className="text-center">
          {expanded ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell className="font-mono text-xs">{review.runId}</TableCell>
        <TableCell className="font-mono text-xs">{review.metricId}</TableCell>
        <TableCell className="font-mono text-xs">
          {review.ruleCheckId}
        </TableCell>
        <TableCell className="text-xs">{review.assignedTeam ?? '-'}</TableCell>
        <TableCell className="text-xs">{review.reviewer ?? '-'}</TableCell>
        <TableCell className="text-xs">
          {shortDatetime(review.reviewDatetime)}
        </TableCell>
        {/* 행 전체가 펼침 토글이므로 버튼 클릭이 행으로 번지지 않게 막는다 */}
        <TableCell onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              aria-label="일지 수정"
              title="수정"
              onClick={() => onEdit(review)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive"
              aria-label="일지 삭제"
              title="삭제"
              onClick={() => onDelete(review)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/20 p-0">
            {/* 검토 수정 시 updatedAt 이 바뀌어 패널이 새로 로드된다 */}
            <ActionsPanel
              key={`${review.reviewId}:${review.updatedAt ?? ''}`}
              reviewId={review.reviewId!}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  )
})
