'use client'

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { QcChart } from '@/lib/api/agent'

const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4']

/** QC Agent 응답의 차트(pie/bar/table) 렌더링 */
export function AgentCharts({ charts }: { charts: readonly QcChart[] }) {
  return (
    <div className="mt-3 space-y-3">
      {charts.map((chart, i) => (
        <div key={i} className="rounded-xl border bg-card p-4">
          <h4 className="mb-2 text-sm font-medium">{chart.title}</h4>
          {chart.type === 'pie' && (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chart.data.items} dataKey="fail" nameKey="category" outerRadius={80} label>
                  {chart.data.items.map((_, j) => (
                    <Cell key={j} fill={COLORS[j % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          {chart.type === 'bar' && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chart.data.labels.map((label, j) => ({ label, value: chart.data.values[j] }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chart.type === 'table' && <ChartTable rows={chart.data.rows} total={chart.data.total} />}
        </div>
      ))}
    </div>
  )
}

function ChartTable({ rows, total }: { rows: Record<string, unknown>[]; total?: number | null }) {
  if (rows.length === 0) return <p className="text-xs text-muted-foreground">{'데이터가 없습니다.'}</p>
  const columns = Object.keys(rows[0])
  return (
    <>
      <div className="max-h-64 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c}>{c}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {columns.map((c) => (
                  <TableCell key={c}>{String(row[c] ?? '')}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {total != null && total > rows.length && (
        <p className="mt-2 text-xs text-muted-foreground">{`전체 ${total.toLocaleString()}건 중 ${rows.length}건 표시`}</p>
      )}
    </>
  )
}
