'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/page-header'
import { DataTabPanel } from './_components/data-tab-panel'
import { patientTabs, clinicalTabs } from './_data/tabs'

const PATIENT_ROW1 = patientTabs.slice(0, 7)
const PATIENT_ROW2 = patientTabs.slice(7)

export default function DataDashboardPage() {
  const [activeDb, setActiveDb] = useState<'patient' | 'clinical'>('patient')

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        <PageHeader title="데이터 대시보드" description="데이터베이스 통계 및 현황" />

        <Tabs value={activeDb} onValueChange={(v) => setActiveDb(v as 'patient' | 'clinical')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="patient" className="text-xs sm:text-sm truncate">환자 진료 DB (KR-CDI)</TabsTrigger>
            <TabsTrigger value="clinical" className="text-xs sm:text-sm truncate">임상시험 DB (통합 DB)</TabsTrigger>
          </TabsList>

          <TabsContent value="patient" className="space-y-4">
            <DataTabPanel tabs={patientTabs} tabRows={[PATIENT_ROW1, PATIENT_ROW2]} />
          </TabsContent>

          <TabsContent value="clinical" className="space-y-4">
            <DataTabPanel tabs={clinicalTabs} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
