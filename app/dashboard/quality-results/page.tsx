'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, AlertCircle, Database, Loader2 } from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { qcApi, STAGE_LABEL, CHECK_STATUS_LABEL } from '@/lib/api'
import type { CheckStatus, DqQualityResultResponse } from '@/lib/api'

const PAGE_SIZE = 20

// 점수 색상 규칙: >=90 green, 80~90 orange, <80 red
function getScoreColor(score: number) {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-orange-500'
  return 'text-red-600'
}

function getStatusBadge(status: CheckStatus) {
  const label = CHECK_STATUS_LABEL[status] ?? '-'
  switch (status) {
    case 1:
      return <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">{label}</Badge>
    case 0:
      return <Badge className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100">{label}</Badge>
    case 2:
      return <Badge className="text-xs bg-red-100 text-red-800 hover:bg-red-100">{label}</Badge>
    default:
      return <Badge className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100">{label}</Badge>
  }
}

function getMetricStatusIcon(metric: DqQualityResultResponse) {
  if (metric.notApplicable === 1) return <XCircle className="w-4 h-4 text-red-600" />
  if (metric.passRate >= 90) return <CheckCircle className="w-4 h-4 text-green-600" />
  if (metric.passRate >= 80) return <AlertCircle className="w-4 h-4 text-orange-500" />
  return <XCircle className="w-4 h-4 text-red-600" />
}

function formatDatetime(value: string | null | undefined) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

// 공용 로딩/에러 표시
function StatusBlock({
  loading,
  error,
  empty,
  emptyMessage,
  onRetry,
}: {
  loading: boolean
  error: string | null
  empty: boolean
  emptyMessage: string
  onRetry: () => void
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        {'불러오는 중...'}
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8">
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onRetry}>
          {'다시 시도'}
        </Button>
      </div>
    )
  }
  if (empty) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }
  return null
}

// 공용 페이지네이션 (이전/다음)
function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-3 py-2 border-t">
      <span className="text-xs text-muted-foreground">{page}{' / '}{totalPages}</span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          {'이전'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          {'다음'}
        </Button>
      </div>
    </div>
  )
}

function QualityResultsContent() {
  const searchParams = useSearchParams()

  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [selectedCheckId, setSelectedCheckId] = useState<number | null>(null)
  const [checksPage, setChecksPage] = useState(1)

  // 딥링크: ?checkId=123 → 마운트 시 선택
  useEffect(() => {
    const raw = searchParams.get('checkId')
    if (raw) {
      const parsed = Number(raw)
      if (!Number.isNaN(parsed)) setSelectedCheckId(parsed)
    }
    // 최초 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 1) Stage별 요약
  const summary = useApi((signal) => qcApi.getQualityResultSummary(signal), [])

  // 2) 검증 실행 내역 (stage 필터)
  const checks = useApi(
    (signal) =>
      qcApi.getQualityCheckLogs(
        { stage: selectedStage ?? undefined, page: checksPage, size: PAGE_SIZE },
        signal,
      ),
    [selectedStage, checksPage],
  )

  // 3) 지표별 결과 (완료 check 선택 시)
  const results = useApi(
    (signal) =>
      selectedCheckId == null
        ? Promise.resolve(null)
        : qcApi.getQualityResultsByCheckId(selectedCheckId, { page: 1, size: PAGE_SIZE }, signal),
    [selectedCheckId],
  )

  const handleStageSelect = (stage: string) => {
    setSelectedStage((prev) => (prev === stage ? null : stage))
    setSelectedCheckId(null)
    setChecksPage(1)
  }

  const summaryItems = summary.data ?? []
  const checkItems = checks.data?.items ?? []
  const metricItems = results.data?.items ?? []

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">{'데이터 품질 결과'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {'품질지표 검증 결과를 확인합니다'}
          </p>
        </div>

        {/* Stage Summary Cards */}
        <div>
          {summary.loading || summary.error || summaryItems.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <StatusBlock
                  loading={summary.loading}
                  error={summary.error}
                  empty={summaryItems.length === 0}
                  emptyMessage="요약 데이터가 없습니다."
                  onRetry={summary.refetch}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {summaryItems.map((item) => {
                const isSelected = selectedStage === item.stage
                return (
                  <div
                    key={item.stage}
                    className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={() => handleStageSelect(item.stage)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {STAGE_LABEL[item.stage] ?? item.stage}
                      </span>
                      <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                        {item.score}
                      </span>
                    </div>
                    <div className="mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {'지표 수 '}{item.metricCount}{'개'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Verification History Table */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {selectedStage ? `${STAGE_LABEL[selectedStage] ?? selectedStage} ` : ''}
                  {'검증 실행 내역'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {'완료된 검증을 선택하여 지표별 결과를 확인하세요'}
                </CardDescription>
              </div>
              {selectedStage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleStageSelect(selectedStage)}
                >
                  {'전체 보기'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {checks.loading || checks.error || checkItems.length === 0 ? (
              <StatusBlock
                loading={checks.loading}
                error={checks.error}
                empty={checkItems.length === 0}
                emptyMessage="검증 실행 내역이 없습니다."
                onRetry={checks.refetch}
              />
            ) : (
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-2 font-medium">{'번호'}</th>
                    <th className="text-left p-2 font-medium">{'실행자'}</th>
                    <th className="text-left p-2 font-medium">{'시작 일시'}</th>
                    <th className="text-left p-2 font-medium">{'종료 일시'}</th>
                    <th className="text-left p-2 font-medium">{'상태'}</th>
                  </tr>
                </thead>
                <tbody>
                  {checkItems.map((row, idx) => {
                    const completed = row.checkStatus === 1
                    const isSelected = selectedCheckId === row.checkId
                    return (
                      <tr
                        key={row.checkId}
                        className={`border-b transition-all ${
                          completed ? 'cursor-pointer' : 'cursor-default opacity-70'
                        } ${
                          isSelected
                            ? 'bg-primary/10 border-l-2 border-l-primary'
                            : completed
                              ? 'hover:bg-muted/30'
                              : ''
                        }`}
                        onClick={() => {
                          if (completed) setSelectedCheckId(row.checkId)
                        }}
                      >
                        <td className="p-2">{(checksPage - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className="p-2">{row.checkStatusFstWrt || '-'}</td>
                        <td className="p-2 font-mono">{formatDatetime(row.checkStartDatetime)}</td>
                        <td className="p-2 font-mono">{formatDatetime(row.checkEndDatetime)}</td>
                        <td className="p-2">{getStatusBadge(row.checkStatus)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            <Pager
              page={checks.data?.page ?? checksPage}
              totalPages={checks.data?.totalPages ?? 1}
              onChange={setChecksPage}
            />
          </CardContent>
        </Card>

        {/* Metric Results for Selected Check */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4" />
              {'지표별 결과'}
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedCheckId == null
                ? '완료된 검증을 선택하면 지표별 결과가 표시됩니다'
                : `검증 #${selectedCheckId}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCheckId == null ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                {'위 표에서 완료된 검증을 선택하세요.'}
              </div>
            ) : results.loading || results.error || metricItems.length === 0 ? (
              <StatusBlock
                loading={results.loading}
                error={results.error}
                empty={metricItems.length === 0}
                emptyMessage="해당 검증의 지표 결과가 없습니다."
                onRetry={results.refetch}
              />
            ) : (
              <div className="space-y-3">
                {metricItems.map((metric) => {
                  const failed = metric.notApplicable === 1
                  return (
                    <div
                      key={metric.metricId}
                      className="p-3 rounded-lg border bg-muted/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{metric.metricNameKor}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {metric.category}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {metric.metricLevel}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {failed ? (
                            <span className="text-xs font-bold text-red-600">{'실행 실패'}</span>
                          ) : (
                            <span className={`text-sm font-bold ${getScoreColor(metric.passRate)}`}>
                              {Number(metric.passRate.toFixed(1))}
                            </span>
                          )}
                          {getMetricStatusIcon(metric)}
                        </div>
                      </div>

                      {failed ? (
                        <p className="text-xs text-red-600/80 mt-2">
                          {metric.notApplicableReason || '사유 없음'}
                        </p>
                      ) : (
                        <div className="mt-2 space-y-1.5">
                          <Progress value={metric.passRate} className="h-1.5" />
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="text-green-600">
                              {'통과 '}{metric.numPassedRows.toLocaleString()}
                            </span>
                            <span className="text-red-600">
                              {'위반 '}{metric.numViolatedRows.toLocaleString()}
                            </span>
                            <span>
                              {'전체 '}{metric.numDenominatorRows.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function QualityResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          {'불러오는 중...'}
        </div>
      }
    >
      <QualityResultsContent />
    </Suspense>
  )
}
