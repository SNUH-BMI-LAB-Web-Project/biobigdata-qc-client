'use client'

import { useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { ApiError, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import {
  EXECUTIONS_PAGE_SIZE,
  VERIFICATION_DATABASES,
} from './verification-config'
import { VerificationHistoryCard } from './verification-history-card'
import {
  VerificationScopeDialog,
  type ScopeSelection,
} from './verification-scope-dialog'
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
  const [selectedIndicator, setSelectedIndicator] = useState('')
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false)

  const {
    data: executionsPage,
    isInitialLoading,
    isRefetching,
    error,
    refetch,
  } = useApi(
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
  const selectedDbInfo = VERIFICATION_DATABASES.find(
    (db) => db.id === selectedDb,
  )
  const requiresSubStage = selectedDbInfo?.requiresSubStage ?? false
  const hasRunningVerification = executions.some((row) => row.checkStatus === 0)
  const isQuality = selectedIndicator === 'quality'
  const canExecute =
    !!selectedDb &&
    !!selectedIndicator &&
    (!requiresSubStage || !!selectedSubStage)

  const handleDbChange = (dbId: string) => {
    setSelectedDb(dbId)
    setSelectedSubStage('')
    setSelectedIndicator('')
  }

  const toggleRow = (rowId: number) => {
    setExpandedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId],
    )
  }

  const buildBaseBody = (): DagRunRequest => ({
    targetStage: selectedDb as Stage,
    ...(requiresSubStage
      ? { targetSubStage: selectedSubStage as DagRunRequest['targetSubStage'] }
      : {}),
  })

  const handleExecute = () => {
    if (hasRunningVerification) {
      alert('이전 검증이 실행 중입니다. 완료된 후 다시 실행해 주세요.')
      return
    }
    if (!canExecute || submitting) return

    // 품질지표만 범위를 세분화할 수 있다. 통계지표는 전체 검증만 지원.
    if (isQuality) {
      setScopeDialogOpen(true)
      return
    }
    void runStats()
  }

  const runStats = async () => {
    setSubmitting(true)
    try {
      await generatedApi
        .POST('/api/qc/statistics-metrics', { body: buildBaseBody() })
        .then((result) => unwrapGeneratedResult<DagRunResponse>(result))
      alert('검증이 시작되었습니다.')
      setCurrentPage(1)
      refetch()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '검증 실행에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const runQuality = async (selection: ScopeSelection) => {
    const baseBody = buildBaseBody()
    const body: DagRunRequest =
      selection.scope === 'ALL'
        ? { ...baseBody, scope: 'ALL' }
        : {
            ...baseBody,
            scope: 'METRIC',
            metricLevel: selection.metricLevel,
            metricIds: selection.metricIds,
            metricCheckIds: selection.metricCheckIds,
          }

    setSubmitting(true)
    try {
      // 지표 단위와 세부지표 단위는 DAG가 달라 최대 2건이 돌아온다.
      const runs = await generatedApi
        .POST('/api/qc/quality-metrics', { body })
        .then((result) => unwrapGeneratedResult<DagRunResponse[]>(result))

      const failed = runs.filter((run) => run.state === 'failed').length
      if (failed === runs.length) {
        alert('검증 실행에 실패했습니다.')
        return
      }
      alert(
        failed === 0
          ? '검증이 시작되었습니다.'
          : `${runs.length - failed}/${runs.length}건 실행 시작. ${failed}건 실패했습니다.`,
      )
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
          selectedIndicator={selectedIndicator}
          requiresSubStage={requiresSubStage}
          hasRunningVerification={hasRunningVerification}
          submitting={submitting}
          canExecute={canExecute}
          onDbChange={handleDbChange}
          onSubStageChange={setSelectedSubStage}
          onIndicatorChange={setSelectedIndicator}
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

      <VerificationScopeDialog
        open={scopeDialogOpen}
        onOpenChange={setScopeDialogOpen}
        targetStage={selectedDb as Stage}
        targetSubStage={requiresSubStage ? selectedSubStage : undefined}
        onConfirm={(selection) => void runQuality(selection)}
      />
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
