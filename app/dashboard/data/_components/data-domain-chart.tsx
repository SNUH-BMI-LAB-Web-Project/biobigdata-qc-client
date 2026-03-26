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
import type { TimePeriod } from '@/app/dashboard/_data/score-history'
import { getPeriodLabels } from '@/app/dashboard/_data/score-history'
import { buildDomainTrendSeries } from '../_data/domain-trend-history'
import {
  getDomainFilterLabel,
  getOrderedDomainKeys,
  type TabDef,
} from '../_data/tabs'

const CHART_ANIMATION_MS = 200

function hueForKey(key: string): number {
  let h = 5381
  for (let i = 0; i < key.length; i++) {
    h = ((h << 5) + h + key.charCodeAt(i)) | 0
  }
  return Math.abs(h) % 360
}

function formatValueTick(n: number) {
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('ko-KR')
}

function xAxisInterval(period: TimePeriod): number {
  if (period === 'all') return 3
  if (period === 'month') return 4
  return 0
}

type SeriesDef = {
  dataKey: string
  kind: 'patient' | 'clinical'
  label: string
  color: string
}

export type DataDomainChartProps = {
  patientTabs: TabDef[]
  clinicalTabs: TabDef[]
  domainVisibility: Record<string, boolean>
  period: TimePeriod
  showPatient: boolean
  showClinical: boolean
}

export function DataDomainChart({
  patientTabs,
  clinicalTabs,
  domainVisibility,
  period,
  showPatient,
  showClinical,
}: DataDomainChartProps) {
  const byPatient = useMemo(
    () => new Map(patientTabs.map(t => [t.value, t])),
    [patientTabs],
  )
  const byClinical = useMemo(
    () => new Map(clinicalTabs.map(t => [t.value, t])),
    [clinicalTabs],
  )

  const visibleKeys = useMemo(() => {
    const keys = getOrderedDomainKeys(patientTabs, clinicalTabs)
    return keys.filter(k => domainVisibility[k])
  }, [patientTabs, clinicalTabs, domainVisibility])

  const { mergedData, seriesDefs, chartConfig, yMin, yMax } = useMemo(() => {
    const labels = getPeriodLabels(period)
    const seriesDefs: SeriesDef[] = []
    const config: ChartConfig = {}

    const rows: Array<Record<string, string | number | null | undefined>> =
      labels.map(m => ({ month: m }))

    for (const key of visibleKeys) {
      const pTab = byPatient.get(key)
      const cTab = byClinical.get(key)
      const raw = buildDomainTrendSeries(period, pTab, cTab)
      const domainLabel = getDomainFilterLabel(key, patientTabs, clinicalTabs)
      const hue = hueForKey(key)
      const color = `hsl(${hue} 58% 46%)`

      if (showPatient && pTab) {
        const dataKey = `p_${key}`
        config[dataKey] = { label: `${domainLabel} · KR-CDI`, color }
        seriesDefs.push({
          dataKey,
          kind: 'patient',
          label: `${domainLabel} · KR-CDI`,
          color,
        })
        for (let i = 0; i < rows.length; i++) {
          rows[i][dataKey] = raw[i]?.patient ?? null
        }
      }

      if (showClinical && cTab) {
        const dataKey = `c_${key}`
        config[dataKey] = {
          label: `${domainLabel} · 통합`,
          color: `hsl(${hue} 58% 52%)`,
        }
        seriesDefs.push({
          dataKey,
          kind: 'clinical',
          label: `${domainLabel} · 통합`,
          color: `hsl(${hue} 58% 52%)`,
        })
        for (let i = 0; i < rows.length; i++) {
          rows[i][dataKey] = raw[i]?.clinical ?? null
        }
      }
    }

    const vals: number[] = []
    for (const row of rows) {
      for (const s of seriesDefs) {
        const v = row[s.dataKey]
        if (typeof v === 'number' && Number.isFinite(v)) vals.push(v)
      }
    }
    let yMin = 70
    let yMax = 115
    if (vals.length > 0) {
      const min = Math.min(...vals)
      const max = Math.max(...vals)
      const pad = (max - min) * 0.06 || 2
      yMin = Math.max(0, Math.floor((min - pad) * 10) / 10)
      yMax = Math.ceil((max + pad) * 10) / 10
    }

    return {
      mergedData: rows,
      seriesDefs,
      chartConfig: config,
      yMin,
      yMax,
    }
  }, [
    visibleKeys,
    byPatient,
    byClinical,
    patientTabs,
    clinicalTabs,
    period,
    showPatient,
    showClinical,
  ])

  const hasSeries = seriesDefs.length > 0

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      {!hasSeries ? (
        <p className="text-muted-foreground py-8 text-center text-xs">
          표시할 영역이 없거나, DB 표시가 꺼져 있습니다.
        </p>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="relative z-20 h-[320px] w-full min-w-0 overflow-visible"
        >
          <LineChart
            data={mergedData}
            margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              fontSize={9}
              interval={xAxisInterval(period)}
              tickMargin={6}
            />
            <YAxis
              domain={[yMin, yMax]}
              tickLine={false}
              axisLine={false}
              fontSize={9}
              tickMargin={6}
              tickFormatter={formatValueTick}
              width={48}
            />
            <ChartTooltip
              wrapperStyle={{ zIndex: 60 }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <ChartLegend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 8 }}
              content={
                <ChartLegendContent className="max-h-28 flex-wrap justify-start gap-x-3 gap-y-1 overflow-y-auto pt-2 text-[10px] leading-tight" />
              }
            />
            {seriesDefs.map(def => (
              <Line
                key={def.dataKey}
                type="monotone"
                dataKey={def.dataKey}
                name={def.dataKey}
                stroke={def.color}
                strokeWidth={1.25}
                strokeDasharray={def.kind === 'clinical' ? '4 3' : undefined}
                dot={false}
                connectNulls
                isAnimationActive
                animationDuration={CHART_ANIMATION_MS}
              />
            ))}
          </LineChart>
        </ChartContainer>
      )}
    </div>
  )
}
