'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { BarChart3, Database, TableIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QualityMetricsTab } from './quality-metrics-tab'
import { StatsTab } from './stats-tab'
import { TablesTab } from './tables-tab'

const TAB_TRIGGER_CLASS = cn(
  "data-[state=active]:bg-background data-[state=active]:shadow-sm text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50",
)

export function IndicatorsView() {
  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        <ViewHeader />
        <TabsPrimitive.Root defaultValue="tables" className="flex flex-col gap-2">
          <TabsPrimitive.List className="bg-muted text-muted-foreground grid w-full max-w-md grid-cols-3 items-center rounded-lg p-[3px] h-9">
            <TabsPrimitive.Trigger value="tables" className={TAB_TRIGGER_CLASS}>
              <Database className="w-3.5 h-3.5" />
              {'테이블 목록'}
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger value="indicators" className={TAB_TRIGGER_CLASS}>
              <TableIcon className="w-3.5 h-3.5" />
              {'품질지표'}
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger value="stats" className={TAB_TRIGGER_CLASS}>
              <BarChart3 className="w-3.5 h-3.5" />
              {'통계지표'}
            </TabsPrimitive.Trigger>
          </TabsPrimitive.List>

          <TabsPrimitive.Content value="tables" className="flex-1 outline-none">
            <TablesTab />
          </TabsPrimitive.Content>
          <TabsPrimitive.Content value="indicators" className="flex-1 outline-none">
            <QualityMetricsTab />
          </TabsPrimitive.Content>
          <TabsPrimitive.Content value="stats" className="flex-1 outline-none">
            <StatsTab />
          </TabsPrimitive.Content>
        </TabsPrimitive.Root>
      </main>
    </div>
  )
}

function ViewHeader() {
  return (
    <div>
      <h1 className="text-xl font-bold">{'지표DB 관리'}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {'원천 테이블 · 품질지표 · 통계지표 관리'}
      </p>
    </div>
  )
}
