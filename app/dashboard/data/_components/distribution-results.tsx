'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DqAchillesResultDistResponse } from '@/lib/api'

interface DistributionResultsProps {
  rows: DqAchillesResultDistResponse[]
  fmtNum: (n: number | null | undefined) => string
  stratumKey: (row: DqAchillesResultDistResponse) => string
}

export function DistributionResults({ rows, fmtNum, stratumKey }: DistributionResultsProps) {
  const chartData = useMemo(
    () =>
      rows.map((row, idx) => {
        const label = stratumKey(row)
        return {
          name: label === '-' ? row.analysisId : label,
          idx,
          min: row.minValue,
          p10: row.p10Value,
          p25: row.p25Value,
          median: row.medianValue,
          avg: row.avgValue,
          p75: row.p75Value,
          p90: row.p90Value,
          max: row.maxValue,
        }
      }),
    [rows, stratumKey],
  )

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9 }}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ fontSize: '11px', padding: '4px 8px' }} />
            <Bar dataKey="min" name="최소" fill="hsl(var(--muted-foreground))" />
            <Bar dataKey="avg" name="평균" fill="hsl(var(--primary))" />
            <Bar dataKey="median" name="중앙값" fill="#3b82f6" />
            <Bar dataKey="max" name="최대" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="text-left p-2 font-medium">{'분석 ID'}</th>
              <th className="text-left p-2 font-medium">{'분류'}</th>
              <th className="text-right p-2 font-medium">{'Count'}</th>
              <th className="text-right p-2 font-medium">{'최소'}</th>
              <th className="text-right p-2 font-medium">{'P10'}</th>
              <th className="text-right p-2 font-medium">{'P25'}</th>
              <th className="text-right p-2 font-medium">{'중앙값'}</th>
              <th className="text-right p-2 font-medium">{'평균'}</th>
              <th className="text-right p-2 font-medium">{'P75'}</th>
              <th className="text-right p-2 font-medium">{'P90'}</th>
              <th className="text-right p-2 font-medium">{'최대'}</th>
              <th className="text-right p-2 font-medium">{'표준편차'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`${row.analysisId}-${idx}`} className="border-b hover:bg-muted/30">
                <td className="p-2 font-mono">{row.analysisId}</td>
                <td className="p-2">{stratumKey(row)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.countValue)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.minValue)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.p10Value)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.p25Value)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.medianValue)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.avgValue)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.p75Value)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.p90Value)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.maxValue)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.stdevValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
