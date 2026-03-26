'use client'

import { Area, AreaChart } from 'recharts'
import {
  ChartContainer,
  type ChartConfig,
} from '@/components/ui/chart'
import type { ScorePoint } from '../_data/score-history'

const config: ChartConfig = {
  score: { label: '점수', color: 'var(--color-primary)' },
}

interface ScoreSparklineProps {
  data: ScorePoint[]
  className?: string
  color?: string
}

export function ScoreSparkline({ data, className = 'h-[28px] w-16', color }: ScoreSparklineProps) {
  const strokeColor = color ?? 'var(--color-primary)'
  const gradId = `spark-${data.map(d => d.score).join('-').slice(0, 20)}`

  return (
    <ChartContainer config={config} className={className}>
      <AreaChart data={data} margin={{ top: 2, right: 1, bottom: 2, left: 1 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="score"
          stroke={strokeColor}
          strokeWidth={1.5}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}
