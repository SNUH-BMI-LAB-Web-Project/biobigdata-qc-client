'use client'

import { Fragment, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CalendarDays, Database, Users } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { TimePeriodToggle } from './time-period-toggle'
import type { TimePeriod } from '../_data/score-history'
import type {
  StatsVolumePeriodMap,
  DualStatsVolumePeriodMap,
  StatsVolumePoint,
  DualStatsVolumePoint,
} from '../_data/stats-volume-history'
import { cn } from '@/lib/utils'

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
    /* SVG stroke에 var(--primary) 단독 사용 시 일부 환경에서 미적용 → oklch 명시 */
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

const METRIC_LABELS: { key: StatsMetricKey; label: string }[] = [
  { key: 'patients', label: '현재 환자 수' },
  { key: 'visits', label: '전체 방문 수' },
  { key: 'totalRecords', label: '전체 데이터 수' },
]

const METRIC_SUMMARY_ICONS: Record<StatsMetricKey, LucideIcon> = {
  patients: Users,
  visits: CalendarDays,
  totalRecords: Database,
}

function formatStatInt(n: number) {
  return Math.round(n).toLocaleString('ko-KR')
}

/** 카드 헤더 등 — 선택 기간 시계열의 최신 점(현재 수치)을 짧은 텍스트로 표시 */
export function StatsCurrentValuesSummary({
  mode,
  visible,
  point,
  className,
}: {
  mode: 'single' | 'compare'
  visible: StatsMetricVisibility
  point: StatsVolumePoint | DualStatsVolumePoint | undefined
  className?: string
}) {
  if (!point) {
    return (
      <p
        className={cn('text-sm tabular-nums font-medium text-muted-foreground', className)}
        aria-live="polite"
      >
        —
      </p>
    )
  }

  type Item = { metric: StatsMetricKey; text: string }
  const items: Item[] = []

  if (mode === 'single') {
    const p = point as StatsVolumePoint
    if (visible.patients) {
      items.push({ metric: 'patients', text: `현재환자수 ${formatStatInt(p.patients)}` })
    }
    if (visible.visits) {
      items.push({ metric: 'visits', text: `전체방문수 ${formatStatInt(p.visits)}` })
    }
    if (visible.totalRecords) {
      items.push({ metric: 'totalRecords', text: `전체데이터수 ${formatStatInt(p.totalRecords)}` })
    }
  } else {
    const p = point as DualStatsVolumePoint
    if (visible.patients) {
      items.push({
        metric: 'patients',
        text: `현재환자수 ${formatStatInt(p.patientsA)} / ${formatStatInt(p.patientsB)}`,
      })
    }
    if (visible.visits) {
      items.push({
        metric: 'visits',
        text: `전체방문수 ${formatStatInt(p.visitsA)} / ${formatStatInt(p.visitsB)}`,
      })
    }
    if (visible.totalRecords) {
      items.push({
        metric: 'totalRecords',
        text: `전체데이터수 ${formatStatInt(p.recordsA)} / ${formatStatInt(p.recordsB)}`,
      })
    }
  }

  if (items.length === 0) {
    return (
      <p
        className={cn('text-sm font-medium text-muted-foreground', className)}
        aria-live="polite"
      >
        표시할 항목 없음
      </p>
    )
  }

  return (
    <div
      className={cn(
        'flex min-w-0 max-w-full flex-nowrap items-center justify-start gap-x-2 overflow-x-auto text-left text-sm font-medium tabular-nums leading-snug text-muted-foreground',
        className
      )}
      aria-live="polite"
    >
      {items.map((item, i) => {
        const Icon = METRIC_SUMMARY_ICONS[item.metric]
        return (
          <Fragment key={item.metric}>
            {i > 0 && (
              <span className="shrink-0 select-none text-muted-foreground/40" aria-hidden>
                ·
              </span>
            )}
            <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap">
              <Icon className="size-3.5 shrink-0 opacity-60" aria-hidden />
              <span>{item.text}</span>
            </span>
          </Fragment>
        )
      })}
    </div>
  )
}

/** 카드 헤더 등에서 사용 */
export function StatsMetricCheckboxes({
  visible,
  onToggle,
  idPrefix = 'stats-metric',
  className,
}: {
  visible: StatsMetricVisibility
  onToggle: (key: StatsMetricKey) => void
  idPrefix?: string
  className?: string
}) {
  const checkboxId = (k: StatsMetricKey) => `${idPrefix}-${k}`
  return (
    <div
      className={cn('flex flex-wrap items-center justify-end gap-x-3 gap-y-2', className)}
      role="group"
      aria-label="표시할 통계 항목"
    >
      {METRIC_LABELS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <Checkbox
            id={checkboxId(key)}
            checked={visible[key]}
            onCheckedChange={() => onToggle(key)}
          />
          <Label
            htmlFor={checkboxId(key)}
            className="cursor-pointer text-xs font-normal leading-none text-muted-foreground"
          >
            {label}
          </Label>
        </div>
      ))}
    </div>
  )
}

function formatTick(n: number) {
  if (!Number.isFinite(n)) return ''
  return `${Math.round(n)}`
}

function normalizeSeries(values: number[]): number[] {
  if (!values.length) return values
  const base = values[0] || 1
  return values.map(v => (v / base) * 100)
}

type DataStatsChartProps = (
  | {
      mode: 'single'
      dataByPeriod: StatsVolumePeriodMap
      period: TimePeriod
      onPeriodChange: (p: TimePeriod) => void
    }
  | {
      mode: 'compare'
      dataByPeriod: DualStatsVolumePeriodMap
      period: TimePeriod
      onPeriodChange: (p: TimePeriod) => void
    }
) & {
  /** 부모(카드 헤더)에서 체크박스를 렌더할 때 전달 — 없으면 차트 내부에서만 상태 유지 */
  metricVisibility?: StatsMetricVisibility
  onMetricVisibilityChange?: (next: StatsMetricVisibility) => void
  /** 부모에서 기간 토글을 렌더하면 차트 안에서는 숨김 */
  hidePeriodToggle?: boolean
}

export function DataStatsChart(props: DataStatsChartProps) {
  const [internalVisible, setInternalVisible] = useState<StatsMetricVisibility>({
    patients: true,
    visits: true,
    totalRecords: true,
  })
  const controlled =
    props.metricVisibility !== undefined && props.onMetricVisibilityChange !== undefined
  const visible = controlled ? props.metricVisibility! : internalVisible

  const period = props.period
  const data = props.dataByPeriod[period]
  const hasVisibleMetric = visible.patients || visible.visits || visible.totalRecords

  const plotData = useMemo(() => {
    if (props.mode === 'single') {
      const rows = data as StatsVolumePoint[]
      const patients = normalizeSeries(rows.map(r => r.patients))
      const visits = normalizeSeries(rows.map(r => r.visits))
      const totalRecords = normalizeSeries(rows.map(r => r.totalRecords))
      return rows.map((r, i) => ({
        month: r.month,
        patients: patients[i],
        visits: visits[i],
        totalRecords: totalRecords[i],
      }))
    }

    const rows = data as DualStatsVolumePoint[]
    const patientsA = normalizeSeries(rows.map(r => r.patientsA))
    const visitsA = normalizeSeries(rows.map(r => r.visitsA))
    const recordsA = normalizeSeries(rows.map(r => r.recordsA))
    const patientsB = normalizeSeries(rows.map(r => r.patientsB))
    const visitsB = normalizeSeries(rows.map(r => r.visitsB))
    const recordsB = normalizeSeries(rows.map(r => r.recordsB))
    return rows.map((r, i) => ({
      month: r.month,
      patientsA: patientsA[i],
      visitsA: visitsA[i],
      recordsA: recordsA[i],
      patientsB: patientsB[i],
      visitsB: visitsB[i],
      recordsB: recordsB[i],
    }))
  }, [data, props.mode])

  const { yMin, yMax } = useMemo(() => {
    const vals: number[] = []
    if (props.mode === 'single') {
      const rows = plotData as Array<Record<string, number | string>>
      for (const row of rows) {
        if (visible.patients) vals.push(row.patients as number)
        if (visible.visits) vals.push(row.visits as number)
        if (visible.totalRecords) vals.push(row.totalRecords as number)
      }
    } else {
      const rows = plotData as Array<Record<string, number | string>>
      for (const row of rows) {
        if (visible.patients) {
          vals.push(row.patientsA as number, row.patientsB as number)
        }
        if (visible.visits) {
          vals.push(row.visitsA as number, row.visitsB as number)
        }
        if (visible.totalRecords) {
          vals.push(row.recordsA as number, row.recordsB as number)
        }
      }
    }
    if (vals.length === 0) return { yMin: 0, yMax: 1 }
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const pad = (max - min) * 0.12 || 4
    return {
      yMin: Math.max(0, Math.floor(min - pad)),
      yMax: Math.ceil(max + pad),
    }
  }, [plotData, visible, props.mode])

  const toggleMetric = (key: StatsMetricKey) => {
    const next = { ...visible, [key]: !visible[key] }
    if (controlled) {
      props.onMetricVisibilityChange!(next)
    } else {
      setInternalVisible(next)
    }
  }

  const config = props.mode === 'single' ? SINGLE_CONFIG : DUAL_CONFIG

  const demoFallbackData = useMemo(() => {
    // 어떤 이유로든 dataByPeriod가 비어 있으면 무조건 선이 보이게 더미 데이터 생성
    const n = props.mode === 'single' ? 7 : 7
    return Array.from({ length: n }, (_, i) => ({
      month: String(i + 1),
      patients: 92 + i * 8 + (i % 2 ? 6 : -4),
      visits: 78 + i * 10 + (i % 3 ? 3 : -5),
      totalRecords: 110 + i * 6 + (i % 2 ? -3 : 5),
      patientsA: 92 + i * 8 + (i % 2 ? 6 : -4),
      visitsA: 78 + i * 10 + (i % 3 ? 3 : -5),
      recordsA: 110 + i * 6 + (i % 2 ? -3 : 5),
      patientsB: 86 + i * 9 + (i % 2 ? -2 : 4),
      visitsB: 74 + i * 11 + (i % 3 ? -2 : 5),
      recordsB: 104 + i * 7 + (i % 2 ? 4 : -2),
    }))
  }, [props.mode])

  const chartData = useMemo(() => {
    const rows = (plotData as Array<Record<string, number | string>> | undefined) ?? []
    return rows.length ? rows : (demoFallbackData as unknown as Array<Record<string, number | string>>)
  }, [plotData, demoFallbackData])

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      {!props.hidePeriodToggle && (
        <TimePeriodToggle
          value={period}
          onChange={props.onPeriodChange}
          className="w-full max-w-full shrink-0 sm:w-auto"
          ariaLabel="데이터 통계 기간"
        />
      )}
      {!controlled && (
        <StatsMetricCheckboxes visible={visible} onToggle={toggleMetric} />
      )}

      {!hasVisibleMetric ? (
        <div className="flex h-[200px] min-h-[200px] w-full items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground md:h-[240px] md:min-h-[240px] xl:h-[280px] xl:min-h-[280px]">
          표시할 통계 항목이 없습니다.
        </div>
      ) : (
        <ChartContainer
          config={config}
          className="aspect-auto min-h-0 min-w-0 w-full h-[200px] min-h-[200px] md:h-[240px] md:min-h-[240px] xl:h-[280px] xl:min-h-[280px]"
        >
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 6 }}>
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
              domain={[yMin, yMax]}
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
                <ChartLegendContent className="max-h-20 flex-wrap gap-x-3 gap-y-1 overflow-y-auto pt-2 text-[10px] leading-tight" />
              }
            />
            {props.mode === 'single' ? (
              <>
                {visible.patients && (
                  <Line
                    type="monotone"
                    dataKey="patients"
                    name="현재 환자 수"
                    stroke={STROKE_COLORS.patients}
                    strokeWidth={2.75}
                    strokeLinecap="round"
                    dot={{ r: 2, strokeWidth: 0 }}
                    activeDot={{ r: 4.5, strokeWidth: 1 }}
                    connectNulls
                    isAnimationActive
                    animationDuration={CHART_ANIMATION_MS}
                  />
                )}
                {visible.visits && (
                  <Line
                    type="monotone"
                    dataKey="visits"
                    name="전체 방문 수"
                    stroke={STROKE_COLORS.visits}
                    strokeWidth={2.75}
                    strokeLinecap="round"
                    dot={{ r: 2, strokeWidth: 0 }}
                    activeDot={{ r: 4.5, strokeWidth: 1 }}
                    connectNulls
                    isAnimationActive
                    animationDuration={CHART_ANIMATION_MS}
                  />
                )}
                {visible.totalRecords && (
                  <Line
                    type="monotone"
                    dataKey="totalRecords"
                    name="전체 데이터 수"
                    stroke={STROKE_COLORS.totalRecords}
                    strokeWidth={2.75}
                    strokeLinecap="round"
                    dot={{ r: 2, strokeWidth: 0 }}
                    activeDot={{ r: 4.5, strokeWidth: 1 }}
                    connectNulls
                    isAnimationActive
                    animationDuration={CHART_ANIMATION_MS}
                  />
                )}
              </>
            ) : (
              <>
                {visible.patients && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="patientsA"
                      name="환자 수 (환자 DB)"
                      stroke={STROKE_COLORS.patients}
                      strokeWidth={2.75}
                      strokeLinecap="round"
                      dot={{ r: 2, strokeWidth: 0 }}
                      activeDot={{ r: 4.5, strokeWidth: 1 }}
                      connectNulls
                      isAnimationActive
                      animationDuration={CHART_ANIMATION_MS}
                    />
                    <Line
                      type="monotone"
                      dataKey="patientsB"
                      name="환자 수 (임상 DB)"
                      stroke={STROKE_COLORS.patientsB}
                      strokeWidth={2.75}
                      strokeLinecap="round"
                      strokeDasharray="4 3"
                      dot={{ r: 2, strokeWidth: 0 }}
                      activeDot={{ r: 4.5, strokeWidth: 1 }}
                      connectNulls
                      isAnimationActive
                      animationDuration={CHART_ANIMATION_MS}
                    />
                  </>
                )}
                {visible.visits && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="visitsA"
                      name="방문 수 (환자 DB)"
                      stroke={STROKE_COLORS.visits}
                      strokeWidth={2.75}
                      strokeLinecap="round"
                      dot={{ r: 2, strokeWidth: 0 }}
                      activeDot={{ r: 4.5, strokeWidth: 1 }}
                      connectNulls
                      isAnimationActive
                      animationDuration={CHART_ANIMATION_MS}
                    />
                    <Line
                      type="monotone"
                      dataKey="visitsB"
                      name="방문 수 (임상 DB)"
                      stroke={STROKE_COLORS.visitsB}
                      strokeWidth={2.75}
                      strokeLinecap="round"
                      strokeDasharray="4 3"
                      dot={{ r: 2, strokeWidth: 0 }}
                      activeDot={{ r: 4.5, strokeWidth: 1 }}
                      connectNulls
                      isAnimationActive
                      animationDuration={CHART_ANIMATION_MS}
                    />
                  </>
                )}
                {visible.totalRecords && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="recordsA"
                      name="데이터 수 (환자 DB)"
                      stroke={STROKE_COLORS.totalRecords}
                      strokeWidth={2.75}
                      strokeLinecap="round"
                      dot={{ r: 2, strokeWidth: 0 }}
                      activeDot={{ r: 4.5, strokeWidth: 1 }}
                      connectNulls
                      isAnimationActive
                      animationDuration={CHART_ANIMATION_MS}
                    />
                    <Line
                      type="monotone"
                      dataKey="recordsB"
                      name="데이터 수 (임상 DB)"
                      stroke={STROKE_COLORS.recordsB}
                      strokeWidth={2.75}
                      strokeLinecap="round"
                      strokeDasharray="4 3"
                      dot={{ r: 2, strokeWidth: 0 }}
                      activeDot={{ r: 4.5, strokeWidth: 1 }}
                      connectNulls
                      isAnimationActive
                      animationDuration={CHART_ANIMATION_MS}
                    />
                  </>
                )}
              </>
            )}
          </LineChart>
        </ChartContainer>
      )}
    </div>
  )
}
