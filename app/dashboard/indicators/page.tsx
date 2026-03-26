import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Database, TableIcon, BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { TablesTab } from './_components/tables-tab'
import { IndicatorsTab } from './_components/indicators-tab'
import { StatsTab } from './_components/stats-tab'

export default function IndicatorsPage() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <main className="container mx-auto flex min-h-0 min-w-0 flex-1 flex-col overflow-x-auto px-4 py-5 sm:px-10 sm:py-5 md:px-16 md:py-6">
        <Tabs defaultValue="tables" className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
          <PageHeader title="지표DB 관리" description="테이블 및 품질 지표 관리">
            <TabsList variant="chip" className="md:ml-auto md:w-auto md:max-w-none md:justify-end">
              <TabsTrigger value="tables" variant="chip">
                <Database className="size-3.5 shrink-0" aria-hidden />
                <span className="min-w-0 text-left leading-snug line-clamp-2">테이블 목록</span>
              </TabsTrigger>
              <TabsTrigger value="indicators" variant="chip">
                <TableIcon className="size-3.5 shrink-0" aria-hidden />
                <span className="min-w-0 text-left leading-snug line-clamp-2">지표 목록</span>
              </TabsTrigger>
              <TabsTrigger value="stats" variant="chip">
                <BarChart3 className="size-3.5 shrink-0" aria-hidden />
                <span className="min-w-0 text-left leading-snug line-clamp-2">통계 목록</span>
              </TabsTrigger>
            </TabsList>
          </PageHeader>

          <TabsContent value="tables" className="mt-0 flex min-h-0 min-w-0 flex-1 flex-col">
            <TablesTab />
          </TabsContent>
          <TabsContent value="indicators" className="mt-0 flex min-h-0 min-w-0 flex-1 flex-col">
            <IndicatorsTab />
          </TabsContent>
          <TabsContent value="stats" className="mt-0 flex min-h-0 min-w-0 flex-1 flex-col">
            <StatsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
