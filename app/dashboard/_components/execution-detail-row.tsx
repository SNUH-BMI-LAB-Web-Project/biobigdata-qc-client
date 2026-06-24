'use client'

import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useApi } from '@/hooks/use-api'
import { STAGE_LABEL, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import { CheckStatusBadge } from '@/components/check-status-badge'
import type { CheckExecutionDetailResponse } from '@/lib/api'

function getScoreColor(score: number) {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-yellow-600'
  return 'text-red-600'
}

export function ExecutionDetailRow({ checkId }: { checkId: number }) {
  const { data, loading, error } = useApi(
    async (signal) =>
      unwrapGeneratedResult<CheckExecutionDetailResponse[]>(
        await generatedApi.GET('/api/qc/executions/{checkId}', {
          params: { path: { checkId } },
          signal,
        }),
      ),
    [checkId],
  )

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
        <Loader2 className="w-3 h-3 animate-spin" />
        {'상세 내역을 불러오는 중...'}
      </div>
    )
  }

  if (error) return <div className="text-xs text-red-600 py-3">{error}</div>
  if (!data || data.length === 0) {
    return <div className="text-xs text-muted-foreground py-3">{'상세 내역이 없습니다.'}</div>
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground mb-2">{'단계별 상세'}</p>
      {data.map((detail, index) => (
        <div key={`${detail.stage}-${index}`} className="p-3 rounded-md border bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs font-medium">
                {STAGE_LABEL[detail.stage] ?? detail.stage}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {'쿼리 '}
                {detail.queryCount}
                {'개'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Timestamp label="시작" value={detail.checkStartDatetime} />
              <Timestamp label="종료" value={detail.checkEndDatetime} />
              {detail.score !== null && detail.score !== undefined ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{'점수:'}</span>
                  <span className={`text-sm font-bold ${getScoreColor(detail.score)}`}>
                    {detail.score}
                  </span>
                </div>
              ) : (
                <CheckStatusBadge status={detail.checkStatus} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Timestamp({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="text-xs text-muted-foreground">
      <span>{label}{': '}</span>
      <span className="font-mono">{value || '-'}</span>
    </div>
  )
}
