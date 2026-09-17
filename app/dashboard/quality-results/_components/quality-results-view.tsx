'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoadingBlock } from '@/components/async-state'
import { StageVersionPanel } from './stage-version-panel'
import { ChecksTable } from './checks-table'
import { MetricResults } from './metric-results'

function QualityResultsContent() {
  const searchParams = useSearchParams()
  // 검증 실행 화면의 '결과 보기' 딥링크 — runId 와 함께 넘어온 stage/subStage 로 선택 상태를 복원한다.
  const deepLink = useMemo(() => {
    const raw = searchParams.get('runId')
    const parsed = raw ? Number(raw) : NaN
    return {
      runId: Number.isNaN(parsed) ? null : parsed,
      stage: searchParams.get('stage'),
      subStage: searchParams.get('subStage'),
    }
  }, [searchParams])

  const [selectedStage, setSelectedStage] = useState<string | null>(
    deepLink.stage,
  )
  // null = 아직 선택 안 함, '' = 버전 구분이 없는 단계(연계DB)
  const [selectedSubStage, setSelectedSubStage] = useState<string | null>(
    deepLink.stage ? (deepLink.subStage ?? '') : null,
  )
  const [selectedRunId, setSelectedRunId] = useState<number | null>(
    deepLink.runId,
  )

  const handleSelect = (stage: string, subStage: string | null) => {
    setSelectedStage(stage)
    setSelectedSubStage(subStage)
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

        <StageVersionPanel
          selectedStage={selectedStage}
          selectedSubStage={selectedSubStage}
          onSelect={handleSelect}
        />
        <ChecksTable
          selectedStage={selectedStage}
          selectedSubStage={selectedSubStage}
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
