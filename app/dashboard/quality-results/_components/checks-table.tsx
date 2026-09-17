'use client'

import { useEffect, useState } from 'react'
import { Database } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AsyncStateBlock, RefreshingContent } from '@/components/async-state'
import { CompactPager } from '@/components/pager'
import { CheckStatusBadge } from '@/components/check-status-badge'
import { useApi } from '@/hooks/use-api'
import {
  STAGE_LABEL,
  runTypeLabel,
  generatedApi,
  unwrapGeneratedResult,
} from '@/lib/api'
import type { DqRunLogResponse, PageResult } from '@/lib/api'
import {
  formatDatetime,
  getScoreColor,
  isFiniteNumber,
} from './quality-result-utils'

const CHECKS_PAGE_SIZE = 5

interface ChecksTableProps {
  selectedStage: string | null
  /** 선택 전이면 null, 버전 구분이 없는 단계(연계DB)면 '' */
  selectedSubStage: string | null
  selectedRunId: number | null
  onSelectRun: (runId: number) => void
}

/** 검증 실행 내역 표 — 실행별 점수/지표 건수를 함께 보여주고, 완료 건 클릭 시 지표별 결과를 띄운다. */
export function ChecksTable({
  selectedStage,
  selectedSubStage,
  selectedRunId,
  onSelectRun,
}: ChecksTableProps) {
  const [page, setPage] = useState(1)

  // 선택이 바뀌면 첫 페이지로
  useEffect(() => setPage(1), [selectedStage, selectedSubStage])

  // DB / 버전을 다 고르기 전에는 조회하지 않는다.
  const ready = !!selectedStage && selectedSubStage !== null

  const checks = useApi(
    async (signal) => {
      if (!ready) return null
      return unwrapGeneratedResult<PageResult<DqRunLogResponse>>(
        await generatedApi.GET('/api/qc/quality-results/checks', {
          params: {
            query: {
              stage: selectedStage ?? undefined,
              subStage: selectedSubStage || undefined,
              page,
              size: CHECKS_PAGE_SIZE,
            },
          },
          signal,
        }),
      )
    },
    [ready, selectedStage, selectedSubStage, page],
  )

  const items = checks.data?.items ?? []

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4" />
              {selectedStage
                ? `${STAGE_LABEL[selectedStage] ?? selectedStage} `
                : ''}
              {'품질 검증 실행 내역'}
            </CardTitle>
            <CardDescription className="text-xs">
              {'완료된 검증을 선택하여 지표별 결과를 확인하세요'}
            </CardDescription>
          </div>
          {ready && (
            <CompactPager
              page={checks.data?.page ?? page}
              totalPages={checks.data?.totalPages ?? 1}
              onChange={setPage}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!ready ? (
          <p className="text-xs text-muted-foreground text-center py-10">
            {'조회할 DB와 데이터 버전을 선택하세요'}
          </p>
        ) : items.length === 0 ? (
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
                  <th className="text-left p-2 font-medium w-24">
                    {'지표 유형'}
                  </th>
                  <th className="text-right p-2 font-medium w-28">
                    {'검증 지표'}
                  </th>
                  <th className="text-right p-2 font-medium w-20">{'점수'}</th>
                  <th className="text-left p-2 font-medium w-28">{'실행자'}</th>
                  <th className="text-left p-2 font-medium w-44">
                    {'시작 일시'}
                  </th>
                  <th className="text-left p-2 font-medium w-44">
                    {'종료 일시'}
                  </th>
                  <th className="text-left p-2 font-medium w-20">{'상태'}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => {
                  const completed = row.runStatus === 1
                  const isSelected = selectedRunId === row.runId
                  return (
                    <tr
                      key={row.runId}
                      className={`border-b transition-all ${
                        completed
                          ? 'cursor-pointer'
                          : 'cursor-default opacity-70'
                      } ${
                        isSelected
                          ? 'bg-primary/10 border-l-2 border-l-primary'
                          : completed
                            ? 'hover:bg-muted/30'
                            : ''
                      }`}
                      onClick={() => {
                        if (completed) onSelectRun(row.runId)
                      }}
                    >
                      <td className="p-2 text-center">
                        {(page - 1) * CHECKS_PAGE_SIZE + idx + 1}
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-[10px]">
                          {runTypeLabel(row.runType)}
                        </Badge>
                      </td>
                      <td className="p-2 text-right font-mono">
                        {isFiniteNumber(row.runCntCheck)
                          ? `${row.runCntCheckType}유형 / ${row.runCntCheck}건`
                          : '-'}
                      </td>
                      <td className="p-2 text-right">
                        {isFiniteNumber(row.score) ? (
                          <span
                            className={`font-bold ${getScoreColor(row.score)}`}
                          >
                            {row.score}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{'-'}</span>
                        )}
                      </td>
                      <td className="p-2 whitespace-normal break-all">
                        {row.createdBy || '-'}
                      </td>
                      <td className="p-2 font-mono">
                        {formatDatetime(row.runStartDatetime)}
                      </td>
                      <td className="p-2 font-mono">
                        {formatDatetime(row.runEndDatetime)}
                      </td>
                      <td className="p-2">
                        <CheckStatusBadge status={row.runStatus} />
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
  )
}
