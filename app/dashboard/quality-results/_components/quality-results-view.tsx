'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, AlertCircle, Database } from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import {
  STAGE_LABEL,
  SUB_STAGE_LABEL,
  checkTypeLabel,
  generatedApi,
  unwrapGeneratedResult,
} from '@/lib/api'
import { AsyncStateBlock, EmptyBlock, LoadingBlock, RefreshingContent } from '../../_components/async-state'
import { CompactPager } from '../../_components/pager'
import { CheckStatusBadge } from '../../_components/check-status-badge'
import type {
  DqCheckLogResponse,
  DqQualityResultResponse,
  DqQualityResultSummaryResponse,
  PageResult,
} from '@/lib/api'

// 검증 실행 내역 · 지표별 결과 모두 5개씩 페이징
const CHECKS_PAGE_SIZE = 5
const RESULTS_PAGE_SIZE = 5

// 점수 색상 규칙: >=90 green, 80~90 orange, <80 red
function getScoreColor(score: number) {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-orange-500'
  return 'text-red-600'
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function getMetricStatusIcon(metric: DqQualityResultResponse) {
  if (metric.notApplicable === 1) return <XCircle className="w-4 h-4 text-red-600" />
  if (!isFiniteNumber(metric.passRate)) return <AlertCircle className="w-4 h-4 text-muted-foreground" />
  if (metric.passRate >= 90) return <CheckCircle className="w-4 h-4 text-green-600" />
  if (metric.passRate >= 80) return <AlertCircle className="w-4 h-4 text-orange-500" />
  return <XCircle className="w-4 h-4 text-red-600" />
}

function formatDatetime(value: string | null | undefined) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

function QualityResultsContent() {
  const searchParams = useSearchParams()
  const deepLinkCheckId = useMemo(() => {
    const raw = searchParams.get('checkId')
    if (!raw) return null
    const parsed = Number(raw)
    return Number.isNaN(parsed) ? null : parsed
  }, [searchParams])

  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [selectedCheckId, setSelectedCheckId] = useState<number | null>(deepLinkCheckId)
  const [checksPage, setChecksPage] = useState(1)
  const [resultsPageState, setResultsPageState] = useState({
    checkId: deepLinkCheckId,
    page: 1,
  })
  const resultsPage =
    resultsPageState.checkId === selectedCheckId ? resultsPageState.page : 1
  const setResultsPage = (page: number) =>
    setResultsPageState({ checkId: selectedCheckId, page })

  // 1) Stage별 요약
  const summary = useApi(
    async (signal) =>
      unwrapGeneratedResult<DqQualityResultSummaryResponse[]>(
        await generatedApi.GET('/api/qc/quality-results/summary', { signal }),
      ),
    [],
  )

  // 2) 검증 실행 내역 (stage 필터)
  const checks = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<DqCheckLogResponse>>(
        await generatedApi.GET('/api/qc/quality-results/checks', {
          params: {
            query: {
              stage: selectedStage ?? undefined,
              page: checksPage,
              size: CHECKS_PAGE_SIZE,
            },
          },
          signal,
        }),
      ),
    [selectedStage, checksPage],
  )

  // 3) 지표별 결과 (완료 check 선택 시)
  const results = useApi(
    async (signal) =>
      selectedCheckId == null
        ? null
        : unwrapGeneratedResult<PageResult<DqQualityResultResponse>>(
            await generatedApi.GET('/api/qc/quality-results/checks/{checkId}/metrics', {
              params: {
                path: { checkId: selectedCheckId },
                query: { page: resultsPage, size: RESULTS_PAGE_SIZE },
              },
              signal,
            }),
          ),
    [selectedCheckId, resultsPage],
  )

  const handleStageSelect = (stage: string) => {
    setSelectedStage((prev) => (prev === stage ? null : stage))
    setSelectedCheckId(null)
    setResultsPageState({ checkId: null, page: 1 })
    setChecksPage(1)
  }

  const summaryItems = summary.data ?? []
  const checkItems = checks.data?.items ?? []
  const metricItems = results.data?.items ?? []

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        <ViewHeader />

        {/* Stage Summary Cards */}
        <div>
          {summary.loading || summary.error || summaryItems.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <AsyncStateBlock
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
              <CompactPager
                page={checks.data?.page ?? checksPage}
                totalPages={checks.data?.totalPages ?? 1}
                onChange={setChecksPage}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {checkItems.length === 0 ? (
              <AsyncStateBlock
                loading={checks.isInitialLoading}
                error={checks.error}
                empty={!checks.isInitialLoading && !checks.error}
                emptyMessage="검증 실행 내역이 없습니다."
                onRetry={checks.refetch}
              />
            ) : (
              <RefreshingContent isRefetching={checks.isRefetching}>
                <table className="w-full text-xs table-fixed">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-center p-2 font-medium w-14">{'번호'}</th>
                      <th className="text-left p-2 font-medium w-24">{'DB'}</th>
                      <th className="text-left p-2 font-medium w-40">{'데이터'}</th>
                      <th className="text-left p-2 font-medium w-24">{'지표 유형'}</th>
                      <th className="text-left p-2 font-medium w-28">{'실행자'}</th>
                      <th className="text-left p-2 font-medium w-44">{'시작 일시'}</th>
                      <th className="text-left p-2 font-medium w-44">{'종료 일시'}</th>
                      <th className="text-left p-2 font-medium w-20">{'상태'}</th>
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
                            if (completed) {
                              setSelectedCheckId(row.checkId)
                              setResultsPageState({ checkId: row.checkId, page: 1 })
                            }
                          }}
                        >
                          <td className="p-2 text-center">{(checksPage - 1) * CHECKS_PAGE_SIZE + idx + 1}</td>
                          <td className="p-2">{STAGE_LABEL[row.stage] ?? row.stage}</td>
                          <td className="p-2 whitespace-normal break-words">
                            {row.subStage ? SUB_STAGE_LABEL[row.subStage] ?? row.subStage : '-'}
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className="text-[10px]">
                              {checkTypeLabel(row.checkType)}
                            </Badge>
                          </td>
                          <td className="p-2 whitespace-normal break-all">{row.checkStatusFstWrt || '-'}</td>
                          <td className="p-2 font-mono">{formatDatetime(row.checkStartDatetime)}</td>
                          <td className="p-2 font-mono">{formatDatetime(row.checkEndDatetime)}</td>
                          <td className="p-2">
                            <CheckStatusBadge status={row.checkStatus} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </RefreshingContent>
            )}
          </CardContent>
        </Card>

        {/* Metric Results for Selected Check */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  {'지표별 결과'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedCheckId == null
                    ? '완료된 검증을 선택하면 지표별 결과가 표시됩니다'
                    : `검증 #${selectedCheckId}`}
                </CardDescription>
              </div>
              {selectedCheckId != null && (
                <CompactPager
                  page={results.data?.page ?? resultsPage}
                  totalPages={results.data?.totalPages ?? 1}
                  onChange={setResultsPage}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedCheckId == null ? (
              <EmptyBlock message="위 표에서 완료된 검증을 선택하세요." />
            ) : metricItems.length === 0 ? (
              <AsyncStateBlock
                loading={results.isInitialLoading}
                error={results.error}
                empty={!results.isInitialLoading && !results.error}
                emptyMessage="해당 검증의 지표 결과가 없습니다."
                onRetry={results.refetch}
              />
            ) : (
              <RefreshingContent isRefetching={results.isRefetching} className="space-y-3">
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
                          ) : !isFiniteNumber(metric.passRate) ? (
                            <span className="text-sm font-bold text-muted-foreground">{'-'}</span>
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
                          <Progress value={metric.passRate ?? 0} className="h-1.5" />
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
              </RefreshingContent>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function ViewHeader() {
  return (
    <div>
      <h1 className="text-xl font-bold">{'데이터 품질 결과'}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {'품질지표 검증 결과를 확인합니다'}
      </p>
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
