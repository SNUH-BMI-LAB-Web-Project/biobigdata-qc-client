'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/use-api'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { DqQualityMetricDetailResponse } from '@/lib/api'
import { MetricSummaryHeader } from './metric-summary-header'
import { MetricInfoCards } from './metric-info-cards'
import { AppliedFieldsTable } from './applied-fields-table'

export function IndicatorDetailView() {
  const router = useRouter()
  const { id: metricId } = useParams<{ id: string }>()

  const { data: detail, loading, error, refetch } = useApi(
    async (signal) =>
      unwrapGeneratedResult<DqQualityMetricDetailResponse>(
        await generatedApi.GET('/api/qc/quality-metrics/{metricId}', {
          params: { path: { metricId } },
          signal,
        }),
      ),
    [metricId],
  )

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-sm text-muted-foreground">{error ?? '지표 정보를 불러오지 못했습니다.'}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <main className="container mx-auto px-4 py-4 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          지표 목록으로 돌아가기
        </Button>

        <MetricSummaryHeader detail={detail} />
        <MetricInfoCards detail={detail} />
        <AppliedFieldsTable metricId={metricId} />
      </main>
    </div>
  )
}
