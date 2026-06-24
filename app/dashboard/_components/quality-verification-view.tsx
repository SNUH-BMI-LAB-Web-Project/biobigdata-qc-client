'use client'

import { useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { ApiError, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import {
  EXECUTIONS_PAGE_SIZE,
  VERIFICATION_DATABASES,
} from './verification-config'
import { VerificationHistoryCard } from './verification-history-card'
import { VerificationSelectionPanel } from './verification-selection-panel'
import type {
  CheckExecutionResponse,
  DagRunRequest,
  DagRunResponse,
  PageResult,
  Stage,
} from '@/lib/api'

export function QualityVerificationView() {
  const [selectedDb, setSelectedDb] = useState('')
  const [selectedSubStage, setSelectedSubStage] = useState('')
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([])
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const { data: executionsPage, isInitialLoading, isRefetching, error, refetch } = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<CheckExecutionResponse>>(
        await generatedApi.GET('/api/qc/executions', {
          params: { query: { page: currentPage, size: EXECUTIONS_PAGE_SIZE } },
          signal,
        }),
      ),
    [currentPage],
  )

  const executions = executionsPage?.items ?? []
  const selectedDbInfo = VERIFICATION_DATABASES.find((db) => db.id === selectedDb)
  const requiresSubStage = selectedDbInfo?.requiresSubStage ?? false
  const hasRunningVerification = executions.some((row) => row.checkStatus === 0)
  const canExecute =
    !!selectedDb && selectedIndicators.length > 0 && (!requiresSubStage || !!selectedSubStage)

  const handleDbChange = (dbId: string) => {
    setSelectedDb(dbId)
    setSelectedSubStage('')
    setSelectedIndicators([])
  }

  const toggleIndicator = (indicatorId: string) => {
    setSelectedIndicators((prev) =>
      prev.includes(indicatorId)
        ? prev.filter((id) => id !== indicatorId)
        : [...prev, indicatorId],
    )
  }

  const toggleRow = (rowId: number) => {
    setExpandedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId],
    )
  }

  const handleExecute = async () => {
    if (hasRunningVerification) {
      alert('이전 검증이 실행 중입니다. 완료된 후 다시 실행해 주세요.')
      return
    }
    if (!canExecute || submitting) return

    const body: DagRunRequest = {
      targetStage: selectedDb as Stage,
      ...(requiresSubStage
        ? { targetSubStage: selectedSubStage as DagRunRequest['targetSubStage'] }
        : {}),
    }

    setSubmitting(true)
    try {
      const tasks: Promise<unknown>[] = []
      if (selectedIndicators.includes('quality')) {
        tasks.push(
          generatedApi
            .POST('/api/qc/quality-metrics', { body })
            .then((result) => unwrapGeneratedResult<DagRunResponse>(result)),
        )
      }
      if (selectedIndicators.includes('stats')) {
        tasks.push(
          generatedApi
            .POST('/api/qc/statistics-metrics', { body })
            .then((result) => unwrapGeneratedResult<DagRunResponse>(result)),
        )
      }

      await Promise.all(tasks)
      alert('검증이 시작되었습니다.')
      setCurrentPage(1)
      refetch()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '검증 실행에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto px-4 py-4 space-y-4">
        <ViewHeader />
        <VerificationSelectionPanel
          selectedDb={selectedDb}
          selectedSubStage={selectedSubStage}
          selectedIndicators={selectedIndicators}
          requiresSubStage={requiresSubStage}
          hasRunningVerification={hasRunningVerification}
          submitting={submitting}
          canExecute={canExecute}
          onDbChange={handleDbChange}
          onSubStageChange={setSelectedSubStage}
          onIndicatorToggle={toggleIndicator}
          onExecute={handleExecute}
        />
        <VerificationHistoryCard
          rows={executions}
          totalCount={executionsPage?.totalCount ?? 0}
          page={currentPage}
          totalPages={executionsPage?.totalPages ?? 1}
          expandedRows={expandedRows}
          loading={isInitialLoading}
          refetching={isRefetching}
          error={error}
          onPageChange={setCurrentPage}
          onRetry={refetch}
          onToggleRow={toggleRow}
        />
      </main>
    </div>
  )
}

function ViewHeader() {
  return (
    <div>
      <h1 className="text-xl font-bold">{'품질검증 실행'}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {'검증 대상 선택 및 품질/통계 지표 검증 실행'}
      </p>
    </div>
  )
}
