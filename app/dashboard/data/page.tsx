'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Database, BarChart3, ListOrdered } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useApi } from '@/hooks/use-api'
import { qcApi, CHECK_STATUS_LABEL, STAGE_LABEL, SUB_STAGE_LABEL } from '@/lib/api'
import type {
  DqCheckLogResponse,
  DqAchillesResultResponse,
  DqAchillesResultDistResponse,
  CheckStatus,
} from '@/lib/api'

const STAGE_OPTIONS = ['LINK', 'PREP', 'COLL', 'INTG', 'OPEN'] as const
const PAGE_SIZE = 20

// 상태 배지 색상: 완료 green / 진행중 blue / 오류 red / 중단 gray
function statusBadgeClass(status: CheckStatus): string {
  switch (status) {
    case 1:
      return 'bg-green-100 text-green-800'
    case 0:
      return 'bg-blue-100 text-blue-800'
    case 2:
      return 'bg-red-100 text-red-800'
    case 3:
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function fmtDate(s: string | null | undefined): string {
  if (!s) return '-'
  return s.replace('T', ' ').slice(0, 19)
}

function fmtNum(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '-'
  return n.toLocaleString()
}

// 비어있지 않은 stratum 이름만 추출
function strata(r: { stratum1Name: string; stratum2Name: string; stratum3Name: string; stratum4Name: string; stratum5Name: string }): string[] {
  return [r.stratum1Name, r.stratum2Name, r.stratum3Name, r.stratum4Name, r.stratum5Name]
    .filter((s) => s !== null && s !== undefined && String(s).trim() !== '')
}

function stratumKey(r: { stratum1Name: string; stratum2Name: string; stratum3Name: string; stratum4Name: string; stratum5Name: string }): string {
  const parts = strata(r)
  return parts.length ? parts.join(' / ') : '-'
}

// ── 상태/로딩/에러/빈 상태 공통 박스 ────────────────────────────
function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      {label ?? '불러오는 중...'}
    </div>
  )
}

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm">
      <p className="text-red-600">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        {'다시 시도'}
      </Button>
    </div>
  )
}

function EmptyBox({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
      {message}
    </div>
  )
}

export default function DataStatisticsResultPage() {
  return (
    <Suspense fallback={<Spinner />}>
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

  // 딥링크 checkId 동기화
  useEffect(() => {
    if (deepLinkCheckId !== null) setSelectedCheckId(deepLinkCheckId)
  }, [deepLinkCheckId])

  // ── 검증 실행 내역 ────────────────────────────────────────────
  const logsApi = useApi(
    (signal) =>
      qcApi.getStatisticsCheckLogs(
        { stage: stage === 'ALL' ? undefined : stage, page, size: PAGE_SIZE },
        signal,
      ),
    [stage, page],
  )

  const logs = logsApi.data?.items ?? []
  const totalPages = logsApi.data?.totalPages ?? 0

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold">{'데이터 통계 결과'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {'통계지표(Achilles) 검증 결과를 확인합니다'}
          </p>
        </div>

        {/* 검증 실행 내역 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  {'통계 검증 실행 내역'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {'완료된 검증을 선택하여 통계 결과를 확인하세요'}
                </CardDescription>
              </div>
              <Select
                value={stage}
                onValueChange={(v) => {
                  setStage(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue placeholder="단계 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{'전체 단계'}</SelectItem>
                  {STAGE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STAGE_LABEL[s] ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {logsApi.loading ? (
              <Spinner label="검증 내역을 불러오는 중..." />
            ) : logsApi.error ? (
              <ErrorBox message={logsApi.error} onRetry={logsApi.refetch} />
            ) : logs.length === 0 ? (
              <EmptyBox message="검증 실행 내역이 없습니다." />
            ) : (
              <>
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="text-left p-2 font-medium">{'번호'}</th>
                      <th className="text-left p-2 font-medium">{'단계'}</th>
                      <th className="text-left p-2 font-medium">{'서브 단계'}</th>
                      <th className="text-left p-2 font-medium">{'실행자'}</th>
                      <th className="text-left p-2 font-medium">{'시작 일시'}</th>
                      <th className="text-left p-2 font-medium">{'종료 일시'}</th>
                      <th className="text-left p-2 font-medium">{'상태'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((row: DqCheckLogResponse) => {
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
                          <td className="p-2 font-mono">{row.checkId}</td>
                          <td className="p-2">{STAGE_LABEL[row.stage] ?? row.stage}</td>
                          <td className="p-2">
                            {row.subStage ? SUB_STAGE_LABEL[row.subStage] ?? row.subStage : '-'}
                          </td>
                          <td className="p-2">{row.checkStatusFstWrt || '-'}</td>
                          <td className="p-2 font-mono">{fmtDate(row.checkStartDatetime)}</td>
                          <td className="p-2 font-mono">{fmtDate(row.checkEndDatetime)}</td>
                          <td className="p-2">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${statusBadgeClass(row.checkStatus)}`}
                            >
                              {CHECK_STATUS_LABEL[row.checkStatus]}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-end gap-2 p-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      {'이전'}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      {'다음'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* 통계 결과 표시 */}
        {selectedCheckId === null ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyBox message="위 내역에서 완료된 검증을 선택하면 통계 결과가 표시됩니다." />
            </CardContent>
          </Card>
        ) : (
          <StatisticsResults checkId={selectedCheckId} />
        )}
      </main>
    </div>
  )
}

// ── 선택한 checkId의 통계 결과 (단순값 + 분포) ──────────────────
function StatisticsResults({ checkId }: { checkId: number }) {
  const countApi = useApi(
    (signal) => qcApi.getAchillesResults(checkId, undefined, signal),
    [checkId],
  )
  const distApi = useApi(
    (signal) => qcApi.getAchillesResultsDist(checkId, undefined, signal),
    [checkId],
  )

  // 단순값은 API가 전체 목록을 반환하므로 클라이언트 페이징
  const [countPage, setCountPage] = useState(1)
  useEffect(() => setCountPage(1), [checkId])
  const countData = (countApi.data as DqAchillesResultResponse[]) ?? []
  const countTotalPages = Math.max(1, Math.ceil(countData.length / PAGE_SIZE))
  const pagedCount = countData.slice((countPage - 1) * PAGE_SIZE, countPage * PAGE_SIZE)

  return (
    <div className="space-y-4">
      {/* 단순값 (distribution=0) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ListOrdered className="w-4 h-4" />
            {'통계 결과 — 단순값'}
          </CardTitle>
          <CardDescription className="text-xs">
            {`검증 #${checkId} · count 값 (distribution=0)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {countApi.loading ? (
            <Spinner />
          ) : countApi.error ? (
            <ErrorBox message={countApi.error} onRetry={countApi.refetch} />
          ) : (countApi.data?.length ?? 0) === 0 ? (
            <EmptyBox message="단순값 통계 결과가 없습니다." />
          ) : (
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left p-2 font-medium">{'분석 ID'}</th>
                  <th className="text-left p-2 font-medium">{'분류 (Stratum)'}</th>
                  <th className="text-right p-2 font-medium">{'Count'}</th>
                </tr>
              </thead>
              <tbody>
                {pagedCount.map((row, idx) => (
                  <tr key={`${row.analysisId}-${idx}`} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{row.analysisId}</td>
                    <td className="p-2">{stratumKey(row)}</td>
                    <td className="p-2 text-right font-mono">{fmtNum(row.countValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {countTotalPages > 1 && (
            <div className="flex items-center justify-end gap-2 p-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={countPage <= 1}
                onClick={() => setCountPage((p) => Math.max(1, p - 1))}
              >
                {'이전'}
              </Button>
              <span className="text-xs text-muted-foreground">
                {countPage} / {countTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={countPage >= countTotalPages}
                onClick={() => setCountPage((p) => Math.min(countTotalPages, p + 1))}
              >
                {'다음'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 분포 (distribution=1) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {'통계 결과 — 분포'}
          </CardTitle>
          <CardDescription className="text-xs">
            {`검증 #${checkId} · 분포 값 (distribution=1)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {distApi.loading ? (
            <Spinner />
          ) : distApi.error ? (
            <ErrorBox message={distApi.error} onRetry={distApi.refetch} />
          ) : (distApi.data?.length ?? 0) === 0 ? (
            <EmptyBox message="분포 통계 결과가 없습니다." />
          ) : (
            <DistributionResults rows={distApi.data as DqAchillesResultDistResponse[]} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DistributionResults({ rows }: { rows: DqAchillesResultDistResponse[] }) {
  return (
    <div className="space-y-4">
      {/* 분위수 막대 차트 (avg, p10~p90, min/max를 막대로 표현) */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows.map((r, idx) => ({
              name: stratumKey(r) === '-' ? r.analysisId : stratumKey(r),
              idx,
              min: r.minValue,
              p10: r.p10Value,
              p25: r.p25Value,
              median: r.medianValue,
              avg: r.avgValue,
              p75: r.p75Value,
              p90: r.p90Value,
              max: r.maxValue,
            }))}
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ fontSize: '11px', padding: '4px 8px' }} />
            <Bar dataKey="min" name="최소" fill="hsl(var(--muted-foreground))" />
            <Bar dataKey="avg" name="평균" fill="hsl(var(--primary))" />
            <Bar dataKey="median" name="중앙값" fill="#3b82f6" />
            <Bar dataKey="max" name="최대" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 분포 상세 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="text-left p-2 font-medium">{'분석 ID'}</th>
              <th className="text-left p-2 font-medium">{'분류'}</th>
              <th className="text-right p-2 font-medium">{'Count'}</th>
              <th className="text-right p-2 font-medium">{'최소'}</th>
              <th className="text-right p-2 font-medium">{'P10'}</th>
              <th className="text-right p-2 font-medium">{'P25'}</th>
              <th className="text-right p-2 font-medium">{'중앙값'}</th>
              <th className="text-right p-2 font-medium">{'평균'}</th>
              <th className="text-right p-2 font-medium">{'P75'}</th>
              <th className="text-right p-2 font-medium">{'P90'}</th>
              <th className="text-right p-2 font-medium">{'최대'}</th>
              <th className="text-right p-2 font-medium">{'표준편차'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`${row.analysisId}-${idx}`} className="border-b hover:bg-muted/30">
                <td className="p-2 font-mono">{row.analysisId}</td>
                <td className="p-2">{stratumKey(row)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.countValue)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.minValue)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.p10Value)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.p25Value)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.medianValue)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.avgValue)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.p75Value)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.p90Value)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.maxValue)}</td>
                <td className="p-2 text-right font-mono">{fmtNum(row.stdevValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
