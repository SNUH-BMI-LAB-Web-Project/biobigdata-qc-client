'use client'

import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { getPeriodLabels, type TimePeriod } from '../_data/score-history'
import type {
  DualStatsVolumePeriodMap,
  StatsVolumePeriodMap,
} from '../_data/stats-volume-history'

const CHART_ANIMATION_MS = 200

const STROKE_COLORS = {
  patients: '#2f7d57',
  visits: '#3b82f6',
  totalRecords: '#16a34a',
  patientsB: '#f59e0b',
  visitsB: '#8b5cf6',
  recordsB: '#10b981',
} as const

const SINGLE_CONFIG: ChartConfig = {
  patients: {
    label: '현재 환자 수',
    theme: {
      light: 'oklch(0.38 0.075 156)',
      dark: 'oklch(0.48 0.08 145)',
    },
  },
  visits: {
    label: '전체 방문 수',
    theme: {
      light: 'oklch(0.45 0.15 250)',
      dark: 'oklch(0.72 0.12 250)',
    },
  },
  totalRecords: {
    label: '전체 데이터 수',
    theme: {
      light: 'oklch(0.45 0.14 150)',
      dark: 'oklch(0.72 0.12 150)',
    },
  },
}

const DUAL_CONFIG: ChartConfig = {
  patientsA: {
    label: '환자 수 (환자 DB)',
    theme: {
      light: 'oklch(0.38 0.075 156)',
      dark: 'oklch(0.48 0.08 145)',
    },
  },
  visitsA: {
    label: '방문 수 (환자 DB)',
    theme: {
      light: 'oklch(0.45 0.15 250)',
      dark: 'oklch(0.72 0.12 250)',
    },
  },
  recordsA: {
    label: '데이터 수 (환자 DB)',
    theme: {
      light: 'oklch(0.45 0.14 150)',
      dark: 'oklch(0.72 0.12 150)',
    },
  },
  patientsB: {
    label: '환자 수 (임상 DB)',
    theme: {
      light: 'oklch(0.55 0.18 45)',
      dark: 'oklch(0.78 0.14 55)',
    },
  },
  visitsB: {
    label: '방문 수 (임상 DB)',
    theme: {
      light: 'oklch(0.5 0.14 280)',
      dark: 'oklch(0.75 0.1 280)',
    },
  },
  recordsB: {
    label: '데이터 수 (임상 DB)',
    theme: {
      light: 'oklch(0.5 0.12 130)',
      dark: 'oklch(0.75 0.1 130)',
    },
  },
}

export type StatsMetricKey = 'patients' | 'visits' | 'totalRecords'
export type StatsMetricVisibility = Record<StatsMetricKey, boolean>

function formatTick(n: number) {
  const num = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(num)) return ''
  const v = Math.round(num)
  if (Math.abs(v) >= 10_000) return `${(v / 10_000).toFixed(1)}만`
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}천`
  return v.toLocaleString('ko-KR')
}

function computeDomain(values: number[]) {
  const finite = values.filter(v => Number.isFinite(v))
  if (!finite.length) return { yMin: 0, yMax: 1 }
  const min = Math.min(...finite)
  const max = Math.max(...finite)
  const pad = (max - min) * 0.12 || Math.max(1, max * 0.06)
  const yMin = Math.max(0, Math.floor(min - pad))
  const yMax = Math.ceil(max + pad)
  return yMin === yMax ? { yMin, yMax: yMax + 1 } : { yMin, yMax }
}

function buildDemoSeries(period: TimePeriod) {
  const labels = getPeriodLabels(period)
  let seed = 17
  for (let i = 0; i < period.length; i++) seed = (seed * 31 + period.charCodeAt(i)) | 0
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) | 0
    return ((seed >>> 0) % 10000) / 10000
  }

  let patients = 15234 * (0.85 + rand() * 0.1)
  let visits = 48567 * (0.82 + rand() * 0.12)
  let totalRecords = 125890 * (0.8 + rand() * 0.12)

  return labels.map((month, i) => {
    patients = Math.max(0, patients + (rand() - 0.48) * 15234 * 0.08 + i * 35)
    visits = Math.max(0, visits + (rand() - 0.48) * 48567 * 0.08 + i * 60)
    totalRecords = Math.max(0, totalRecords + (rand() - 0.48) * 125890 * 0.07 + i * 110)
    return {
      month,
      patients: Math.round(patients),
      visits: Math.round(visits),
      totalRecords: Math.round(totalRecords),
    }
  })
}

export function DataStatsRechartsChart({
  mode: _mode,
  period,
  dataByPeriod: _dataByPeriod,
  visible: _visible,
  className,
}: {
  mode: 'single' | 'compare'
  period: TimePeriod
  dataByPeriod: StatsVolumePeriodMap | DualStatsVolumePeriodMap
  visible: StatsMetricVisibility
  className?: string
}) {
  const data = useMemo(() => buildDemoSeries(period), [period])

  const domain = useMemo(() => {
    const vals = data.flatMap(row => [row.patients, row.visits, row.totalRecords])
    return computeDomain(vals)
  }, [data])

  const config = SINGLE_CONFIG

  return (
    <ChartContainer
      config={config}
      className={className ?? 'aspect-auto min-h-0 min-w-0 w-full h-[200px] min-h-[200px] md:h-[240px] md:min-h-[240px] xl:h-[280px] xl:min-h-[280px]'}
    >
      <LineChart data={data as any} margin={{ top: 4, right: 4, bottom: 0, left: 6 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          tickMargin={4}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[domain.yMin, domain.yMax]}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          width={52}
          tickMargin={4}
          tickFormatter={formatTick}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <ChartLegend
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{ paddingTop: 8 }}
          content={
            <ChartLegendContent className="max-h-20 flex-wrap gap-x-3 gap-y-1 overflow-y-auto !pt-1 text-xs" />
          }
        />

        <Line
          type="monotone"
          dataKey="patients"
          name="현재 환자 수"
          stroke={STROKE_COLORS.patients}
          strokeWidth={2.75}
          strokeLinecap="round"
          dot={false}
          activeDot={{ r: 4.5, strokeWidth: 1 }}
          connectNulls
          isAnimationActive
          animationDuration={CHART_ANIMATION_MS}
        />
        <Line
          type="monotone"
          dataKey="visits"
          name="전체 방문 수"
          stroke={STROKE_COLORS.visits}
          strokeWidth={2.75}
          strokeLinecap="round"
          dot={false}
          activeDot={{ r: 4.5, strokeWidth: 1 }}
          connectNulls
          isAnimationActive
          animationDuration={CHART_ANIMATION_MS}
        />
        <Line
          type="monotone"
          dataKey="totalRecords"
          name="전체 데이터 수"
          stroke={STROKE_COLORS.totalRecords}
          strokeWidth={2.75}
          strokeLinecap="round"
          dot={false}
          activeDot={{ r: 4.5, strokeWidth: 1 }}
          connectNulls
          isAnimationActive
          animationDuration={CHART_ANIMATION_MS}
        />
      </LineChart>
    </ChartContainer>
  )
}

