'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { QUALITY_SCORE_CRITERIA } from '@/lib/quality-score'

interface QualityScorePopoverProps {
  trigger: React.ReactNode
}

export function QualityScorePopover({ trigger }: QualityScorePopoverProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const place = (e: React.MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-sm h-9"
        onMouseEnter={(e) => {
          place(e)
          setOpen(true)
        }}
        onMouseLeave={() => setOpen(false)}
        onClick={(e) => {
          place(e)
          setOpen((value) => !value)
        }}
      >
        {trigger}
      </Button>

      {open && (
        <div
          className="fixed z-50 w-60 rounded-md border bg-popover text-popover-foreground p-3 shadow-md"
          style={{
            left: position.x + 14,
            top: position.y - 12,
            transform: 'translateY(-100%)',
          }}
        >
          <p className="text-sm font-semibold mb-2">{'대시보드 품질 점수 기준'}</p>
          <div className="space-y-1.5 text-sm">
            <ScoreRule colorClass="bg-green-500" label="우수" value={`${QUALITY_SCORE_CRITERIA.excellent}점 이상`} textClass="text-green-600" />
            <ScoreRule
              colorClass="bg-yellow-500"
              label="양호"
              value={`${QUALITY_SCORE_CRITERIA.good}점 ~ ${QUALITY_SCORE_CRITERIA.excellent - 1}점`}
              textClass="text-yellow-600"
            />
            <ScoreRule colorClass="bg-red-500" label="보통" value={`${QUALITY_SCORE_CRITERIA.fair}점 미만`} textClass="text-red-600" />
          </div>
        </div>
      )}
    </>
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
