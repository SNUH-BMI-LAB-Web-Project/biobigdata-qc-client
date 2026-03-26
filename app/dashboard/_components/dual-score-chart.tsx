'use client'

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'

const config: ChartConfig = {
  db1: { label: '환자 진료 DB', color: 'var(--color-chart-1)' },
  db2: { label: '임상시험 DB', color: 'var(--color-chart-2)' },
}

interface DualScoreChartProps {
  data: { month: string; db1: number; db2: number }[]
  height?: string
}

export function DualScoreChart({ data, height = 'h-[180px]' }: DualScoreChartProps) {
  const allScores = data.flatMap(d => [d.db1, d.db2])
  const yMin = Math.max(0, Math.floor(Math.min(...allScores) / 5) * 5 - 5)

  return (
    <ChartContainer config={config} className={`w-full ${height}`}>
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
          dot={{ r: 3 }}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="db2"
          stroke="var(--color-db2)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
