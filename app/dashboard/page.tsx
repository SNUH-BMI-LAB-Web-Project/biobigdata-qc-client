'use client'

import { useState, useCallback, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FlaskConical, LayoutGrid, Stethoscope } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { qualityData, buildIndicatorDetail } from './_data/quality-data'
import { DatabaseSection } from './_components/database-section'
import { IndicatorDetailDialog } from './_components/indicator-detail-dialog'
import type { IndicatorSelection } from './_components/indicator-detail-dialog'

export default function DashboardPage() {
  const [activeDb, setActiveDb] = useState<'all' | 'patient' | 'clinical'>('patient')
  const [indicatorSelection, setIndicatorSelection] = useState<IndicatorSelection | null>(null)

  const selectedIndicator = useMemo(
    () =>
      indicatorSelection
        ? buildIndicatorDetail(
            indicatorSelection.dbKey,
            indicatorSelection.categoryIndex,
            indicatorSelection.indicatorIndex
          )
        : null,
    [indicatorSelection]
  )

  const handleIndicatorClick = useCallback((dbKey: 'db1' | 'db2', categoryIndex: number, indicatorIndex: number) => {
    setIndicatorSelection({ dbKey, categoryIndex, indicatorIndex })
  }, [])

  const handleIndicatorNavigate = useCallback((dbKey: 'db1' | 'db2', categoryIndex: number, indicatorIndex: number) => {
    setIndicatorSelection({ dbKey, categoryIndex, indicatorIndex })
  }, [])

  return (
    <div className="flex-1 flex flex-col">
      <main className="mx-auto w-full max-w-[min(100%,1400px)] space-y-4 px-4 py-5 sm:px-8 sm:py-6 lg:px-10">
        <Tabs value={activeDb} onValueChange={(v) => setActiveDb(v as 'all' | 'patient' | 'clinical')}>
          <PageHeader title="품질검증 대시보드" description="데이터베이스별 품질 검증 지표 및 점수 현황">
            <TabsList variant="chip" className="md:ml-auto md:w-auto md:max-w-none md:justify-end">
              <TabsTrigger value="patient" variant="chip">
                <Stethoscope className="size-3.5 shrink-0" aria-hidden />
                <span className="min-w-0 text-left leading-snug line-clamp-2">
                  환자 진료 DB (KR-CDI)
                </span>
              </TabsTrigger>
              <TabsTrigger value="clinical" variant="chip">
                <FlaskConical className="size-3.5 shrink-0" aria-hidden />
                <span className="min-w-0 text-left leading-snug line-clamp-2">
                  임상시험 DB (통합 DB)
                </span>
              </TabsTrigger>
              <TabsTrigger value="all" variant="chip">
                <LayoutGrid className="size-3.5 shrink-0" aria-hidden />
                <span className="whitespace-nowrap leading-snug">전체</span>
              </TabsTrigger>
            </TabsList>
          </PageHeader>

          <TabsContent value="patient" className="space-y-4 mt-4">
            <DatabaseSection
              dbKey="db1"
              data={qualityData.db1}
              dashboardTab="patient"
              onIndicatorClick={(catIdx, indIdx) => handleIndicatorClick('db1', catIdx, indIdx)}
            />
          </TabsContent>

          <TabsContent value="clinical" className="space-y-4 mt-4">
            <DatabaseSection
              dbKey="db2"
              data={qualityData.db2}
              dashboardTab="clinical"
              onIndicatorClick={(catIdx, indIdx) => handleIndicatorClick('db2', catIdx, indIdx)}
            />
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-4">
            <DatabaseSection
              dbKey="db1"
              data={qualityData.db1}
              dashboardTab="all"
              compareData={qualityData.db2}
              onIndicatorClick={(catIdx, indIdx) => handleIndicatorClick('db1', catIdx, indIdx)}
            />
          </TabsContent>
        </Tabs>
      </main>

      <IndicatorDetailDialog
        indicator={selectedIndicator}
        selection={indicatorSelection}
        onNavigate={handleIndicatorNavigate}
        onClose={() => setIndicatorSelection(null)}
      />
    </div>
  )
}
