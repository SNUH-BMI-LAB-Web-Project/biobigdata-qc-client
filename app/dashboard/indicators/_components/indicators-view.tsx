'use client'

import { BarChart3, Database, TableIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QualityMetricsTab } from './quality-metrics-tab'
import { StatsTab } from './stats-tab'
import { TablesTab } from './tables-tab'

export function IndicatorsView() {
  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        <ViewHeader />
        <Tabs defaultValue="tables">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="tables" className="gap-1.5 text-sm">
              <Database className="w-3.5 h-3.5" />
              {'테이블 목록'}
            </TabsTrigger>
            <TabsTrigger value="indicators" className="gap-1.5 text-sm">
              <TableIcon className="w-3.5 h-3.5" />
              {'품질지표'}
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1.5 text-sm">
              <BarChart3 className="w-3.5 h-3.5" />
              {'통계지표'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tables">
            <TablesTab />
          </TabsContent>
          <TabsContent value="indicators">
            <QualityMetricsTab />
          </TabsContent>
          <TabsContent value="stats">
            <StatsTab />
          </TabsContent>
        </Tabs>
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
