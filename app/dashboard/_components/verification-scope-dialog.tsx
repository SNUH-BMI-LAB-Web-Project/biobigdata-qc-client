'use client'

import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ChevronDown, ChevronRight, Play, Search, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/use-api'
import { useDebounced } from '@/hooks/use-debounced'
import { generatedApi, STAGE_LABEL, SUB_STAGE_LABEL, unwrapGeneratedResult } from '@/lib/api'
import { VERIFICATION_METRIC_LEVELS } from './verification-config'
import type {
  CheckPickerItemResponse,
  MetricLevel,
  MetricPickerItemResponse,
  Stage,
} from '@/lib/api'

const OVERLAY_CLASS =
  'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'

/** metricId → 부분 선택된 세부지표 ID 목록. 세분화 단위는 모달 전체가 하나만 쓴다. */
type SelectedChecks = Record<string, string[]>

/**
 * 검색어가 '세부지표 ID'에 걸린 지표만 비어 있지 않다 — 이 지표는 목록도 매칭된 것만 보여 주고,
 * 지표 체크박스도 지표 전체가 아니라 매칭된 세부지표만 선택한다(= 필터 모드).
 * 지표명·지표ID로만 걸렸거나 검색어가 없으면 빈 배열이라 기존 '지표 전체' 동작 그대로다.
 */
const matchedCheckIdsOf = (metric?: MetricPickerItemResponse) => metric?.matchedCheckIds ?? []

export type ScopeSelection =
  | { scope: 'ALL' }
  | {
      scope: 'METRIC'
      metricLevel: MetricLevel
      metricIds: string[]
      metricCheckIds: string[]
    }

interface VerificationScopeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetStage: Stage
  targetSubStage?: string
  onConfirm: (selection: ScopeSelection) => void
}

export function VerificationScopeDialog({
  open,
  onOpenChange,
  targetStage,
  targetSubStage,
  onConfirm,
}: VerificationScopeDialogProps) {
  const [scope, setScope] = useState<'ALL' | 'METRIC'>('ALL')
  const [metricLevel, setMetricLevel] = useState<MetricLevel>('TABLE')
  const [keyword, setKeyword] = useState('')
  const [expandedMetricId, setExpandedMetricId] = useState('')
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>([])
  const [selectedChecks, setSelectedChecks] = useState<SelectedChecks>({})

  const debouncedKeyword = useDebounced(keyword)

  /** 세분화 단위를 바꾸면 목록 자체가 달라지므로 선택·검색·펼침 상태를 모두 비운다. */
  const clearSelection = () => {
    setKeyword('')
    setExpandedMetricId('')
    setSelectedMetricIds([])
    setSelectedChecks({})
  }

  const reset = () => {
    setScope('ALL')
    setMetricLevel('TABLE')
    clearSelection()
  }

  const requestClose = (next: boolean) => {
    if (next) {
      onOpenChange(true)
      return
    }
    reset()
    onOpenChange(false)
  }

  const handleMetricLevelChange = (level: MetricLevel) => {
    if (level === metricLevel) return
    setMetricLevel(level)
    clearSelection()
  }

  // 지표관리 탭이 쓰는 /quality-metrics와 달리 이 피커 전용 API는
  // 세분화 단위로 서버에서 걸러 전량 반환하고, 검색도 지표ID·세부지표ID·지표명으로만 한다.
  const metricsApi = useApi(
    async (signal) =>
      open && scope === 'METRIC'
        ? unwrapGeneratedResult<MetricPickerItemResponse[]>(
            await generatedApi.GET('/api/qc/quality-metrics/picker', {
              params: {
                query: {
                  metricLevel,
                  stage: targetStage,
                  keyword: debouncedKeyword || undefined,
                },
              },
              signal,
            }),
          )
        : null,
    [open, scope, metricLevel, targetStage, debouncedKeyword],
  )
  const metrics = metricsApi.data ?? []

  const expandedMetric = metrics.find((metric) => metric.metricId === expandedMetricId)

  // 아코디언이라 한 번에 하나만 펼쳐진다 — useApi를 그대로 재사용할 수 있는 이유.
  const checksApi = useApi(
    async (signal) =>
      open && expandedMetric?.metricId
        ? unwrapGeneratedResult<CheckPickerItemResponse[]>(
            await generatedApi.GET('/api/qc/quality-metrics/checks', {
              params: {
                query: {
                  metricLevel,
                  metricId: expandedMetric.metricId,
                  stage: targetStage,
                },
              },
              signal,
            }),
          )
        : null,
    [open, expandedMetric?.metricId, metricLevel, targetStage],
  )
  // 아코디언을 옮기는 동안 이전 지표의 응답이 남아 있을 수 있어 metricId로 한 번 더 거른다.
  const checks = (checksApi.data ?? []).filter(
    (check) => check.metricId === expandedMetric?.metricId,
  )
  const expandedMatched = matchedCheckIdsOf(expandedMetric)
  // 검색어가 세부지표 ID에 걸린 지표는 매칭된 것만 보여 준다.
  const visibleChecks =
    expandedMatched.length > 0
      ? checks.filter((check) => check.checkId && expandedMatched.includes(check.checkId))
      : checks
  // 세부지표 토글은 펼쳐진 지표에서만 일어나므로 이 목록이 곧 '그 지표의 전체 세부지표'다.
  // 필터 모드에서도 '지표 전체 선택'을 개별 선택으로 풀 때는 반드시 이 전체 목록을 써야 한다 —
  // 보이는 것만 쓰면 매칭 안 된 세부지표가 조용히 선택 해제된다.
  const allCheckIds = checks
    .map((check) => check.checkId)
    .filter((checkId): checkId is string => Boolean(checkId))

  const clearChecksOf = (metricId: string) => {
    const next = { ...selectedChecks }
    delete next[metricId]
    setSelectedChecks(next)
  }

  const toggleMetric = (metricId: string, matched: string[]) => {
    const fullySelected = selectedMetricIds.includes(metricId)
    const partial = selectedChecks[metricId] ?? []

    // 필터 모드: 화면에 보이는 건 부분집합이므로 '지표 전체'로는 절대 올리지 않는다.
    if (matched.length > 0) {
      if (fullySelected) {
        setSelectedMetricIds(selectedMetricIds.filter((id) => id !== metricId))
      }
      const covered = fullySelected || matched.every((id) => partial.includes(id))
      // 이전 검색에서 골라 둔 세부지표는 건드리지 않고 매칭된 것만 켜고 끈다.
      const nextCheckIds = covered
        ? partial.filter((id) => !matched.includes(id))
        : [...new Set([...partial, ...matched])]

      const next = { ...selectedChecks }
      if (nextCheckIds.length === 0) delete next[metricId]
      else next[metricId] = nextCheckIds
      setSelectedChecks(next)
      return
    }

    // 전체든 부분이든 뭔가 선택돼 있으면 한 번 누를 때 전부 해제한다.
    if (fullySelected || partial.length > 0) {
      if (fullySelected) {
        setSelectedMetricIds(selectedMetricIds.filter((id) => id !== metricId))
      }
      if (partial.length > 0) clearChecksOf(metricId)
      return
    }
    setSelectedMetricIds([...selectedMetricIds, metricId])
  }

  const toggleCheck = (metricId: string, checkId: string) => {
    const metricSelected = selectedMetricIds.includes(metricId)
    // 지표 전체 선택은 세부지표가 모두 켜진 것으로 보이므로,
    // 그 상태에서 하나를 끄면 나머지를 명시적인 부분 선택으로 풀어 둔다.
    const current = metricSelected ? allCheckIds : (selectedChecks[metricId] ?? [])
    const nextCheckIds = current.includes(checkId)
      ? current.filter((id) => id !== checkId)
      : [...current, checkId]

    // 반대로 세부지표를 다 채우면 '지표 전체' 선택으로 승격한다.
    // 단 필터 모드에선 보이는 게 부분집합이라 다 채워도 '지표 전체'가 아니다.
    const coversAll =
      expandedMatched.length === 0 &&
      allCheckIds.length > 0 &&
      allCheckIds.every((id) => nextCheckIds.includes(id))

    if (coversAll) {
      if (!metricSelected) setSelectedMetricIds([...selectedMetricIds, metricId])
      clearChecksOf(metricId)
      return
    }

    const next = { ...selectedChecks }
    if (nextCheckIds.length === 0) delete next[metricId]
    else next[metricId] = nextCheckIds
    setSelectedChecks(next)

    if (metricSelected) {
      setSelectedMetricIds(selectedMetricIds.filter((id) => id !== metricId))
    }
  }

  const totalCheckCount = Object.values(selectedChecks).reduce(
    (sum, checkIds) => sum + checkIds.length,
    0,
  )

  const canConfirm = scope === 'ALL' || selectedMetricIds.length > 0 || totalCheckCount > 0

  const handleConfirm = () => {
    if (!canConfirm) return
    if (scope === 'ALL') {
      onConfirm({ scope: 'ALL' })
    } else {
      onConfirm({
        scope: 'METRIC',
        metricLevel,
        metricIds: selectedMetricIds,
        metricCheckIds: Object.values(selectedChecks).flat(),
      })
    }
    reset()
    onOpenChange(false)
  }

  const contextLabel = [
    STAGE_LABEL[targetStage],
    targetSubStage ? SUB_STAGE_LABEL[targetSubStage] : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <DialogPrimitive.Root open={open} onOpenChange={requestClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={OVERLAY_CLASS} />
        <DialogPrimitive.Content className="bg-background fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border shadow-lg sm:max-w-lg">
          <div className="px-6 pt-6 pb-4">
            <DialogPrimitive.Title className="text-lg font-semibold flex items-center gap-2">
              <Play className="w-4 h-4" />
              {'검증 범위 선택'}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-xs text-muted-foreground mt-1">
              {contextLabel}
            </DialogPrimitive.Description>
            <DialogPrimitive.Close
              className="absolute top-4 right-4 opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <ScopeOption
                title="전체 검증"
                description="선택 대상의 모든 지표를 검증합니다"
                selected={scope === 'ALL'}
                onClick={() => {
                  clearSelection()
                  setScope('ALL')
                }}
              />
              <ScopeOption
                title="지표 단위 검증"
                description="지표를 펼쳐 세부지표까지 골라 검증합니다"
                selected={scope === 'METRIC'}
                onClick={() => setScope('METRIC')}
              />
            </div>

            {scope === 'METRIC' && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-medium">{'세분화 단위 선택'}</p>
                <div className="grid grid-cols-3 gap-2">
                  {VERIFICATION_METRIC_LEVELS.map((level) => (
                    <MetricLevelOption
                      key={level.id}
                      level={level.id}
                      description={level.description}
                      selected={metricLevel === level.id}
                      onClick={() => handleMetricLevelChange(level.id)}
                    />
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="지표 ID, 세부지표 ID 또는 지표명 검색"
                    className="pl-10 h-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {`지표 ${selectedMetricIds.length}개 · 세부지표 ${totalCheckCount}개 선택`}
                </p>
                <div className="max-h-72 overflow-y-auto border rounded-md divide-y">
                  {metricsApi.isInitialLoading ? (
                    <ListState message="불러오는 중..." />
                  ) : metricsApi.error ? (
                    <ListState message={metricsApi.error} />
                  ) : metrics.length === 0 ? (
                    <ListState message="해당 조건의 지표가 없습니다" />
                  ) : (
                    metrics.map((metric) => {
                      const metricId = metric.metricId ?? ''
                      const partial = selectedChecks[metricId] ?? []
                      const metricSelected = selectedMetricIds.includes(metricId)
                      const matched = matchedCheckIdsOf(metric)
                      // 필터 모드에선 '매칭된 세부지표를 다 골랐는가'가 곧 체크 상태다.
                      const coversMatched =
                        matched.length > 0 && matched.every((id) => partial.includes(id))
                      const checked =
                        metricSelected || coversMatched
                          ? true
                          : partial.length > 0
                            ? 'indeterminate'
                            : false
                      const expanded = expandedMetricId === metricId

                      return (
                        <div key={metricId}>
                          <div className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50">
                            <button
                              type="button"
                              aria-label={expanded ? '세부지표 접기' : '세부지표 펼치기'}
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => setExpandedMetricId(expanded ? '' : metricId)}
                            >
                              {expanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleMetric(metricId, matched)}
                              aria-label={
                                matched.length > 0
                                  ? `${metric.metricNameKor} 매칭된 세부지표 전체 선택`
                                  : `${metric.metricNameKor} 전체 선택`
                              }
                            />
                            <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">
                              {metricId}
                            </span>
                            <span className="flex-1 truncate text-sm">{metric.metricNameKor}</span>
                            {metric.category && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded border text-muted-foreground shrink-0">
                                {metric.category}
                              </span>
                            )}
                          </div>

                          {expanded && (
                            <div className="bg-muted/30 border-t">
                              {/* 전체가 아니라 검색에 걸린 것만 보인다는 걸 명시한다. */}
                              {matched.length > 0 && !checksApi.loading && !checksApi.error && (
                                <p className="px-3 pt-2 text-[11px] text-muted-foreground">
                                  {`검색어와 일치하는 세부지표 ${visibleChecks.length}개`}
                                </p>
                              )}
                              {checksApi.loading ? (
                                <ListState message="세부지표 불러오는 중..." />
                              ) : checksApi.error ? (
                                <ListState message={checksApi.error} />
                              ) : visibleChecks.length === 0 ? (
                                <ListState
                                  message={
                                    matched.length > 0
                                      ? '검색어와 일치하는 세부지표가 없습니다'
                                      : '세부지표가 없습니다'
                                  }
                                />
                              ) : (
                                visibleChecks.map((check) => (
                                  <label
                                    key={check.checkId}
                                    className="flex items-center gap-2 pl-12 pr-3 py-1.5 text-xs cursor-pointer hover:bg-muted/50"
                                  >
                                    <Checkbox
                                      checked={metricSelected || partial.includes(check.checkId!)}
                                      onCheckedChange={() => toggleCheck(metricId, check.checkId!)}
                                    />
                                    <span className="font-mono text-muted-foreground w-24 shrink-0">
                                      {check.checkId}
                                    </span>
                                    <span className="flex-1 truncate">
                                      {[check.tableName, check.fieldName]
                                        .filter(Boolean)
                                        .join(' / ')}
                                    </span>
                                  </label>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 flex justify-end gap-2 border-t">
            <Button type="button" variant="outline" onClick={() => requestClose(false)}>
              {'취소'}
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={!canConfirm} className="gap-2">
              <Play className="w-4 h-4" />
              {'검증 실행'}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function ScopeOption({
  title,
  description,
  selected,
  disabled,
  disabledReason,
  onClick,
}: {
  title: string
  description: string
  selected: boolean
  disabled?: boolean
  disabledReason?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
        disabled
          ? 'opacity-50 cursor-not-allowed border-border'
          : selected
            ? 'border-primary bg-primary/10 cursor-pointer'
            : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">
        {disabled && disabledReason ? disabledReason : description}
      </p>
    </button>
  )
}

function MetricLevelOption({
  level,
  description,
  selected,
  onClick,
}: {
  level: MetricLevel
  description: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <span className="block font-mono text-sm font-semibold">{level}</span>
      <span className="block text-[11px] text-muted-foreground mt-0.5">{description}</span>
    </button>
  )
}

function ListState({ message }: { message: string }) {
  return <p className="text-xs text-muted-foreground text-center py-6">{message}</p>
}
