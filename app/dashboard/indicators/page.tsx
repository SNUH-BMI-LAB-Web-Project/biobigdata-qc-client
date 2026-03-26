import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Database, TableIcon, BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { TablesTab } from './_components/tables-tab'
import { IndicatorsTab } from './_components/indicators-tab'
import { StatsTab } from './_components/stats-tab'

export default function IndicatorsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        <PageHeader title="지표DB 관리" description="테이블 및 품질 지표 관리" />

        <Tabs defaultValue="tables">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="tables" className="gap-1 sm:gap-1.5 text-xs sm:text-sm truncate">
              <Database className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">테이블 목록</span>
            </TabsTrigger>
            <TabsTrigger value="indicators" className="gap-1 sm:gap-1.5 text-xs sm:text-sm truncate">
              <TableIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">지표 목록</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1 sm:gap-1.5 text-xs sm:text-sm truncate">
              <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">통계 목록</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tables">
            <TablesTab />
          </TabsContent>
          <TabsContent value="indicators">
            <IndicatorsTab />
          </TabsContent>
          <TabsContent value="stats">
            <StatsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
