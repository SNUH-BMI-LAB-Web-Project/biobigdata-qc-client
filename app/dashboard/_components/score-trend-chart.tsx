'use client'

import { useState, useMemo, useId } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { type TimePeriod, type PeriodDataMap } from '../_data/score-history'
import { TimePeriodToggle } from './time-period-toggle'

/** DualScoreChart 범례·라인과 동일 (환자=db1 primary, 임상=db2 오렌지) */
const SERIES_CONFIG: Record<
  'db1' | 'db2',
  { label: string; theme: { light: string; dark: string } }
> = {
  db1: {
    label: '환자 진료 DB',
    theme: {
      light: 'oklch(0.38 0.075 156)',
      dark: 'oklch(0.48 0.08 145)',
    },
  },
  db2: {
    label: '임상시험 DB',
    theme: {
      light: 'oklch(0.55 0.18 45)',
      dark: 'oklch(0.78 0.14 55)',
    },
  },
}

const PRIMARY_FALLBACK: ChartConfig = {
  score: { label: '점수', color: 'oklch(0.38 0.075 156)' },
}

/** 기간 전환 시 라인/영역 그리기 애니메이션 (짧게) */
const CHART_ANIMATION_MS = 200

interface ScoreTrendChartProps {
  dataByPeriod: PeriodDataMap
  height?: string
  showGrid?: boolean
  showAxis?: boolean
  thresholdLine?: number
  /** 단일 DB 탭: 전체 탭 이중선 차트와 동일 색 (db1=환자, db2=임상) */
  series?: 'db1' | 'db2'
  /** 부모 제어 시 전달 (예: 카드 헤더에 기간 토글) */
  period?: TimePeriod
  onPeriodChange?: (period: TimePeriod) => void
  /** false면 기간 토글 숨김 — 부모에서 렌더 */
  showPeriodToggle?: boolean
}

export function ScoreTrendChart({
  dataByPeriod,
  height = 'h-[240px]',
  showGrid = true,
  showAxis = true,
  thresholdLine,
  series,
  period: periodProp,
  onPeriodChange,
  showPeriodToggle = true,
}: ScoreTrendChartProps) {
  const [internalPeriod, setInternalPeriod] = useState<TimePeriod>('week')
  const controlled = periodProp !== undefined && onPeriodChange !== undefined
  const period = controlled ? periodProp : internalPeriod
  const setPeriod = controlled ? onPeriodChange : setInternalPeriod
  const data = dataByPeriod[period]
  const gradId = useId().replace(/:/g, '')

  const chartConfig = useMemo((): ChartConfig => {
    if (!series) return PRIMARY_FALLBACK
    return { score: SERIES_CONFIG[series] }
  }, [series])

  const strokeVar = series ? 'var(--color-score)' : 'oklch(0.38 0.075 156)'

  const yMin = useMemo(() => {
    const minScore = Math.min(...data.map(d => d.score))
    return Math.max(0, Math.floor(minScore / 5) * 5 - 5)
  }, [data])

  return (
    <div className={showPeriodToggle ? 'space-y-5' : undefined}>
      {showPeriodToggle && <TimePeriodToggle value={period} onChange={setPeriod} />}
      <ChartContainer config={chartConfig} className={`aspect-auto min-h-0 min-w-0 w-full ${height}`}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: showAxis ? -20 : -30 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeVar} stopOpacity={0.3} />
              <stop offset="100%" stopColor={strokeVar} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
          {showAxis && (
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} tickMargin={4} />
          )}
          {showAxis && (
            <YAxis domain={[yMin, 100]} tickLine={false} axisLine={false} fontSize={10} tickMargin={4} />
          )}
          <ChartTooltip
            content={<ChartTooltipContent indicator="line" />}
          />
          {thresholdLine != null && (
            <ReferenceLine y={thresholdLine} stroke="var(--color-destructive)" strokeDasharray="4 4" strokeOpacity={0.5} />
          )}
          <Area
            type="monotone"
            dataKey="score"
            stroke={strokeVar}
            strokeWidth={2}
            fill={`url(#${gradId})`}
            dot={false}
            activeDot={{ r: 4, fill: strokeVar, stroke: 'var(--background)', strokeWidth: 1 }}
            isAnimationActive
            animationDuration={CHART_ANIMATION_MS}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
