'use client'

import { useState, useMemo } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { type TimePeriod, type DualPeriodDataMap } from '../_data/score-history'
import { TimePeriodToggle } from './time-period-toggle'

const config: ChartConfig = {
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

const CHART_ANIMATION_MS = 200

interface DualScoreChartProps {
  dataByPeriod: DualPeriodDataMap
  height?: string
  period?: TimePeriod
  onPeriodChange?: (period: TimePeriod) => void
  showPeriodToggle?: boolean
}

export function DualScoreChart({
  dataByPeriod,
  height = 'h-[360px]',
  period: periodProp,
  onPeriodChange,
  showPeriodToggle = true,
}: DualScoreChartProps) {
  const [internalPeriod, setInternalPeriod] = useState<TimePeriod>('week')
  const controlled = periodProp !== undefined && onPeriodChange !== undefined
  const period = controlled ? periodProp : internalPeriod
  const setPeriod = controlled ? onPeriodChange : setInternalPeriod
  const data = dataByPeriod[period]

  const yMin = useMemo(() => {
    const allScores = data.flatMap(d => [d.db1, d.db2])
    return Math.max(0, Math.floor(Math.min(...allScores) / 5) * 5 - 5)
  }, [data])

  return (
    <div className={showPeriodToggle ? 'space-y-5' : undefined}>
      {showPeriodToggle && <TimePeriodToggle value={period} onChange={setPeriod} />}
      <ChartContainer config={config} className={`aspect-auto min-h-0 min-w-0 w-full ${height}`}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} tickMargin={4} />
          <YAxis domain={[yMin, 100]} tickLine={false} axisLine={false} fontSize={10} tickMargin={4} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey="db1"
            stroke="var(--color-db1)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--color-db1)', strokeWidth: 1, stroke: 'var(--background)' }}
            isAnimationActive
            animationDuration={CHART_ANIMATION_MS}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="db2"
            stroke="var(--color-db2)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--color-db2)', strokeWidth: 1, stroke: 'var(--background)' }}
            isAnimationActive
            animationDuration={CHART_ANIMATION_MS}
            animationEasing="ease-out"
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
