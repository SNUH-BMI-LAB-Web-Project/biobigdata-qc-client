'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoadingBlock } from '@/components/async-state'
import { StageSummaryCards } from './stage-summary-cards'
import { ChecksTable } from './checks-table'
import { MetricResults } from './metric-results'

function QualityResultsContent() {
  const searchParams = useSearchParams()
  const deepLinkRunId = useMemo(() => {
    const raw = searchParams.get('runId')
    if (!raw) return null
    const parsed = Number(raw)
    return Number.isNaN(parsed) ? null : parsed
  }, [searchParams])

  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [selectedRunId, setSelectedRunId] = useState<number | null>(
    deepLinkRunId,
  )

  const handleSelectStage = (stage: string) => {
    setSelectedStage((prev) => (prev === stage ? null : stage))
    setSelectedRunId(null)
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold">{'데이터 품질 결과'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {'품질지표 검증 결과를 확인합니다'}
          </p>
        </div>

        <StageSummaryCards
          selectedStage={selectedStage}
          onSelectStage={handleSelectStage}
        />
        <ChecksTable
          selectedStage={selectedStage}
          selectedRunId={selectedRunId}
          onSelectRun={setSelectedRunId}
        />
        <MetricResults runId={selectedRunId} />
      </main>
    </div>
  )
}

export default function QualityResultsView() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <QualityResultsContent />
    </Suspense>
  )
}
