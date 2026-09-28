'use client'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { QUALITY_SCORE_CRITERIA } from '@/lib/quality-score'

interface QualityScorePopoverProps {
  trigger: React.ReactNode
  collapsed?: boolean
}

export function QualityScorePopover({
  trigger,
  collapsed = false,
}: QualityScorePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={
            collapsed
              ? 'h-10 w-full px-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              : 'h-10 w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }
          aria-label="품질 점수 기준"
        >
          {trigger}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        aria-label="대시보드 품질 점수 기준"
        className="w-64"
      >
        <p className="text-sm font-semibold mb-2">
          {'대시보드 품질 점수 기준'}
        </p>
        <div className="space-y-1.5 text-sm">
          <ScoreRule
            colorClass="bg-success"
            label="우수"
            value={`${QUALITY_SCORE_CRITERIA.excellent}점 이상`}
            textClass="text-success"
          />
          <ScoreRule
            colorClass="bg-warning"
            label="양호"
            value={`${QUALITY_SCORE_CRITERIA.good}점 ~ ${QUALITY_SCORE_CRITERIA.excellent - 1}점`}
            textClass="text-warning"
          />
          <ScoreRule
            colorClass="bg-destructive"
            label="보통"
            value={`${QUALITY_SCORE_CRITERIA.fair}점 미만`}
            textClass="text-destructive"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ScoreRule({
  colorClass,
  label,
  value,
  textClass,
}: {
  colorClass: string
  label: string
  value: string
  textClass: string
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-muted/40">
      <span className="flex items-center gap-2">
        <span className={`h-2.5 w-4 rounded inline-block ${colorClass}`} />
        {label}
      </span>
      <span className={`font-medium ${textClass}`}>{value}</span>
    </div>
  )
}
