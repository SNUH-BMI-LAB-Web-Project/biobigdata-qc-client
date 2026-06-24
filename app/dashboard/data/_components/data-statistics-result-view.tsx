'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyBlock, LoadingBlock } from '@/components/async-state'
import { DbCountCards } from './db-count-cards'
import { StatisticsHistoryTable } from './statistics-history-table'
import { StatisticsResults } from './statistics-results'

function DataStatisticsResultContent() {
  const searchParams = useSearchParams()
  const deepLinkCheckId = useMemo(() => {
    const v = searchParams.get('checkId')
    if (!v) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }, [searchParams])

  const [stage, setStage] = useState<string>('ALL')
  const [selectedCheckId, setSelectedCheckId] = useState<number | null>(deepLinkCheckId)

  // DB 카드 클릭 → 단계 필터 토글 (이미 선택된 카드 재클릭 시 전체로)
  const handleSelectStage = (s: string) => {
    setStage((prev) => (prev === s ? 'ALL' : s))
    setSelectedCheckId(null)
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold">{'데이터 통계 결과'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {'통계지표(Achilles) 검증 결과를 확인합니다'}
          </p>
        </div>

        <DbCountCards stage={stage} onSelectStage={handleSelectStage} />
        <StatisticsHistoryTable
          stage={stage}
          selectedCheckId={selectedCheckId}
          onSelectCheck={setSelectedCheckId}
        />

        {selectedCheckId === null ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyBlock message="위 내역에서 완료된 검증을 선택하면 통계 결과가 표시됩니다." />
            </CardContent>
          </Card>
        ) : (
          <StatisticsResults checkId={selectedCheckId} />
        )}
      </main>
    </div>
  )
}

export default function DataStatisticsResultView() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <DataStatisticsResultContent />
    </Suspense>
  )
}
