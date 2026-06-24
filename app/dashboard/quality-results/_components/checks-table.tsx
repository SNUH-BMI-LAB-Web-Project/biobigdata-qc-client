'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AsyncStateBlock, RefreshingContent } from '@/components/async-state'
import { CompactPager } from '@/components/pager'
import { CheckStatusBadge } from '@/components/check-status-badge'
import { useApi } from '@/hooks/use-api'
import {
  STAGE_LABEL,
  SUB_STAGE_LABEL,
  checkTypeLabel,
  generatedApi,
  unwrapGeneratedResult,
} from '@/lib/api'
import type { DqCheckLogResponse, PageResult } from '@/lib/api'
import { formatDatetime } from './quality-result-utils'

const CHECKS_PAGE_SIZE = 5

interface ChecksTableProps {
  selectedStage: string | null
  selectedCheckId: number | null
  onSelectCheck: (checkId: number) => void
}

/** 검증 실행 내역 표 — 완료 건 클릭 시 지표별 결과를 띄운다. */
export function ChecksTable({ selectedStage, selectedCheckId, onSelectCheck }: ChecksTableProps) {
  const [page, setPage] = useState(1)

  // 단계 필터가 바뀌면 첫 페이지로
  useEffect(() => setPage(1), [selectedStage])

  const checks = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<DqCheckLogResponse>>(
        await generatedApi.GET('/api/qc/quality-results/checks', {
          params: { query: { stage: selectedStage ?? undefined, page, size: CHECKS_PAGE_SIZE } },
          signal,
        }),
      ),
    [selectedStage, page],
  )

  const items = checks.data?.items ?? []

  return (
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
            page={checks.data?.page ?? page}
            totalPages={checks.data?.totalPages ?? 1}
            onChange={setPage}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
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
                {items.map((row, idx) => {
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
                        if (completed) onSelectCheck(row.checkId)
                      }}
                    >
                      <td className="p-2 text-center">{(page - 1) * CHECKS_PAGE_SIZE + idx + 1}</td>
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
  )
}
