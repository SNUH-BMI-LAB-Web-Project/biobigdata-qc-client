'use client'

import { TIME_PERIOD_LABELS, type TimePeriod } from '@/app/dashboard/_data/score-history'
import { cn } from '@/lib/utils'

const ORDER: TimePeriod[] = ['all', 'year', 'month', 'week']

export type TimePeriodToggleProps = {
  value: TimePeriod
  onChange: (period: TimePeriod) => void
  className?: string
  /** 기본값: 점수 기간 */
  ariaLabel?: string
}

/** 전체 / 년도 / 월 / 주 — 지표 상세 칩과 동일한 버튼 스타일 */
export function TimePeriodToggle({ value, onChange, className, ariaLabel = '점수 기간' }: TimePeriodToggleProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} role="tablist" aria-label={ariaLabel}>
      {ORDER.map(p => (
        <button
          key={p}
          type="button"
          role="tab"
          aria-selected={value === p}
          onClick={() => onChange(p)}
          className={cn(
            'shrink-0 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors',
            value === p
              ? 'border-primary/35 bg-primary/10 text-primary'
              : 'border-transparent bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {TIME_PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  )
}
