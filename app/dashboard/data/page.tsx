'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { TimePeriodToggle } from '@/app/dashboard/_components/time-period-toggle'
import type { TimePeriod } from '@/app/dashboard/_data/score-history'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataSingleDbTable } from './_components/data-compare-table'
import { DataDomainChart } from './_components/data-domain-chart'
import { DataDomainRowFilters } from './_components/data-domain-row-filters'
import {
  getOrderedDomainKeys,
  patientTabs,
  clinicalTabs,
} from './_data/tabs'

function buildInitialDomainVisibility(): Record<string, boolean> {
  const keys = getOrderedDomainKeys(patientTabs, clinicalTabs)
  return Object.fromEntries(keys.map(k => [k, true]))
}

export default function DataDashboardPage() {
  const [period, setPeriod] = useState<TimePeriod>('week')
  const [showPatient, setShowPatient] = useState(true)
  const [showClinical, setShowClinical] = useState(true)
  const [domainVisibility, setDomainVisibility] = useState(buildInitialDomainVisibility)

  const toggleDomain = (key: string) => {
    setDomainVisibility(v => ({ ...v, [key]: !v[key] }))
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto space-y-8 px-10 py-5 sm:px-16 sm:py-6">
        <PageHeader
          title="영역별 데이터 통계"
          description="환자 진료 DB(KR-CDI)와 임상시험 DB(통합)의 도메인별 집계"
        />

        <Card className="gap-0 py-4">
          <CardHeader className="px-6 pb-2">
            <CardTitle className="text-base">도메인별 주요 지표</CardTitle>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div
                className="flex flex-wrap gap-x-4 gap-y-2"
                role="group"
                aria-label="비교할 데이터베이스"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="domain-chart-patient"
                    checked={showPatient}
                    onCheckedChange={v => setShowPatient(v === true)}
                  />
                  <Label
                    htmlFor="domain-chart-patient"
                    className="cursor-pointer text-xs font-normal leading-none text-muted-foreground"
                  >
                    환자 진료 DB (KR-CDI)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="domain-chart-clinical"
                    checked={showClinical}
                    onCheckedChange={v => setShowClinical(v === true)}
                  />
                  <Label
                    htmlFor="domain-chart-clinical"
                    className="cursor-pointer text-xs font-normal leading-none text-muted-foreground"
                  >
                    임상시험 DB (통합)
                  </Label>
                </div>
              </div>
              <TimePeriodToggle
                value={period}
                onChange={setPeriod}
                ariaLabel="시계열 기간"
                className="shrink-0"
              />
            </div>
            <DataDomainRowFilters
              patientTabs={patientTabs}
              clinicalTabs={clinicalTabs}
              domainVisibility={domainVisibility}
              onToggleDomain={toggleDomain}
            />
          </CardHeader>
          <CardContent className="px-6 pt-2">
            <DataDomainChart
              patientTabs={patientTabs}
              clinicalTabs={clinicalTabs}
              domainVisibility={domainVisibility}
              period={period}
              showPatient={showPatient}
              showClinical={showClinical}
            />
          </CardContent>
        </Card>

        <div className="mb-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-8 lg:items-start">
          <div className="min-w-0">
            <DataSingleDbTable
              tabs={patientTabs}
              description="KR-CDI 기준 영역별 통계입니다."
              columnHeading="환자 진료 DB (KR-CDI)"
            />
          </div>
          <div className="min-w-0">
            <DataSingleDbTable
              tabs={clinicalTabs}
              description="통합 DB 기준 영역별 통계입니다."
              columnHeading="임상시험 DB (통합 DB)"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
