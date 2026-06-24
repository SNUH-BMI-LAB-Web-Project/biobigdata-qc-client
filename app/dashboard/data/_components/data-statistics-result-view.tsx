'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database } from 'lucide-react'
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
import { StatisticsResults } from './statistics-results'
import { fmtDate } from './statistics-format'
import type {
  DqCheckLogResponse,
  PageResult,
} from '@/lib/api'

// DB 카드로 노출하는 단계 (수집DB(COLL)는 UI에 표시하지 않음 — 품질 결과와 동일)
const STAGE_CARDS = ['LINK', 'PREP', 'INTG', 'OPEN'] as const
const LOGS_PAGE_SIZE = 5 // 검증 실행 내역 (품질 결과와 동일하게 5개씩)

export default function DataStatisticsResultView() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <DataStatisticsResultContent />
    </Suspense>
  )
}

function DataStatisticsResultContent() {
  const searchParams = useSearchParams()
  const deepLinkCheckId = useMemo(() => {
    const v = searchParams.get('checkId')
    if (!v) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }, [searchParams])

  const [stage, setStage] = useState<string>('ALL')
  const [page, setPage] = useState(1)
  const [selectedCheckId, setSelectedCheckId] = useState<number | null>(deepLinkCheckId)

  // ── 검증 실행 내역 ────────────────────────────────────────────
  const logsApi = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<DqCheckLogResponse>>(
        await generatedApi.GET('/api/qc/statistics-results/checks', {
          params: {
            query: { stage: stage === 'ALL' ? undefined : stage, page, size: LOGS_PAGE_SIZE },
          },
          signal,
        }),
      ),
    [stage, page],
  )

  const logs = logsApi.data?.items ?? []
  const totalPages = logsApi.data?.totalPages ?? 0

  // ── DB(단계)별 검증 건수 ──────────────────────────────────────
  // 통계 결과엔 요약 API가 없으므로 stage별 totalCount를 조회해 카드에 표시
  const countsApi = useApi(
    async (signal) => {
      const entries = await Promise.all(
        STAGE_CARDS.map(async (s) => {
          const res = await unwrapGeneratedResult<PageResult<DqCheckLogResponse>>(
            await generatedApi.GET('/api/qc/statistics-results/checks', {
              params: { query: { stage: s, page: 1, size: 1 } },
              signal,
            }),
          )
          return [s, res.totalCount] as const
        }),
      )
      return Object.fromEntries(entries) as Record<string, number>
    },
    [],
  )
  const counts = countsApi.data ?? {}

  // DB 카드 클릭 → 단계 필터 토글 (이미 선택된 카드 재클릭 시 전체로)
  const handleStageSelect = (s: string) => {
    setStage((prev) => (prev === s ? 'ALL' : s))
    setSelectedCheckId(null)
    setPage(1)
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        <ViewHeader />

        {/* DB 선택 카드 (품질 결과와 동일한 방식) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {STAGE_CARDS.map((s) => {
            const isSelected = stage === s
            const count = counts[s] ?? 0
            return (
              <div
                key={s}
                className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => handleStageSelect(s)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{STAGE_LABEL[s] ?? s}</span>
                  <span className="text-lg font-bold">
                    {countsApi.loading ? '-' : count}
                  </span>
                </div>
                <div className="mt-0.5">
                  <span className="text-xs text-muted-foreground">{'검증 실행 건수'}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* 검증 실행 내역 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  {stage === 'ALL'
                    ? '통계 검증 실행 내역'
                    : `${STAGE_LABEL[stage] ?? stage} 통계 검증 실행 내역`}
                </CardTitle>
                <CardDescription className="text-xs">
                  {'완료된 검증을 선택하여 통계 결과를 확인하세요'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <CompactPager page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {logs.length === 0 ? (
              <AsyncStateBlock
                loading={logsApi.isInitialLoading}
                loadingMessage="검증 내역을 불러오는 중..."
                error={logsApi.error}
                empty={!logsApi.isInitialLoading && !logsApi.error}
                emptyMessage="검증 실행 내역이 없습니다."
                onRetry={logsApi.refetch}
              />
            ) : (
              <RefreshingContent isRefetching={logsApi.isRefetching}>
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
                    {logs.map((row: DqCheckLogResponse, idx) => {
                      const isCompleted = row.checkStatus === 1
                      const isSelected = selectedCheckId === row.checkId
                      return (
                        <tr
                          key={row.checkId}
                          className={`border-b transition-all ${
                            isCompleted ? 'cursor-pointer' : 'opacity-60'
                          } ${
                            isSelected
                              ? 'bg-primary/10 border-l-2 border-l-primary'
                              : isCompleted
                                ? 'hover:bg-muted/30'
                                : ''
                          }`}
                          onClick={() => {
                            if (isCompleted) setSelectedCheckId(row.checkId)
                          }}
                        >
                          <td className="p-2 text-center">{(page - 1) * LOGS_PAGE_SIZE + idx + 1}</td>
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
                          <td className="p-2 font-mono">{fmtDate(row.checkStartDatetime)}</td>
                          <td className="p-2 font-mono">{fmtDate(row.checkEndDatetime)}</td>
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

        {/* 통계 결과 표시 */}
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

function ViewHeader() {
  return (
    <div>
      <h1 className="text-xl font-bold">{'데이터 통계 결과'}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {'통계지표(Achilles) 검증 결과를 확인합니다'}
      </p>
    </div>
  )
}
