'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { ScorePoint } from '../_data/score-history'

const config: ChartConfig = {
  score: { label: '점수', color: 'var(--color-primary)' },
}

interface ScoreTrendChartProps {
  data: ScorePoint[]
  height?: string
  showGrid?: boolean
  showAxis?: boolean
  thresholdLine?: number
}

export function ScoreTrendChart({
  data,
  height = 'h-[120px]',
  showGrid = true,
  showAxis = true,
  thresholdLine,
}: ScoreTrendChartProps) {
  const minScore = Math.min(...data.map(d => d.score))
  const yMin = Math.max(0, Math.floor(minScore / 5) * 5 - 5)

  return (
    <ChartContainer config={config} className={`w-full ${height}`}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: showAxis ? -20 : -30 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
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
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#scoreGrad)"
          dot={{ r: 3, fill: 'var(--color-primary)' }}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
