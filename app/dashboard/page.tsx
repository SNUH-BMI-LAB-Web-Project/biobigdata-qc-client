'use client'

import { useState, Fragment } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'

import {
  Database,
  Clock,
  FileCheck,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BarChart3,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  User,
  Loader2,
} from 'lucide-react'

import { useApi } from '@/hooks/use-api'
import { qcApi, ApiError, CHECK_STATUS_LABEL, STAGE_LABEL, SUB_STAGE_LABEL } from '@/lib/api'
import type { CheckStatus, DagRunRequest, Stage } from '@/lib/api'

// 검증 대상 DB 목록 (stage 코드 기준 — 수집DB(COLL)는 UI에 표시하지 않음)
// requiresSubStage: 사전개방/본개방 구분 여부. 연계DB(LINK)는 구분하지 않음.
const databases = [
  { id: 'LINK', name: '연계DB', description: '원천 데이터 연계 저장소', requiresSubStage: false },
  { id: 'PREP', name: '전처리DB', description: '데이터 정제 및 전처리 저장소', requiresSubStage: true },
  { id: 'INTG', name: '통합DB', description: '통합 데이터 저장소', requiresSubStage: true },
  { id: 'OPEN', name: '개방DB', description: '데이터 개방 저장소', requiresSubStage: true },
]

// 검증 대상 데이터 (개방 구분) — target_sub_stage 값
const subStages = [
  { id: 'preview_open', name: '사전 개방' },
  { id: 'main_open', name: '본 개방' },
]

// 지표 유형 (quality / stats → 통계는 achilles DAG)
const indicatorTypes = [
  { id: 'quality', name: '품질지표', icon: ClipboardCheck },
  { id: 'stats', name: '통계지표', icon: BarChart3 },
]

const ITEMS_PER_PAGE = 5

// checkType(quality/achilles) → 한글 라벨
function checkTypeLabel(checkType: string): string {
  if (checkType === 'quality') return '품질지표'
  if (checkType === 'achilles') return '통계지표'
  return checkType
}

function getScoreColor(score: number) {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-yellow-600'
  return 'text-red-600'
}

function getStatusBadge(status: CheckStatus) {
  switch (status) {
    case 1:
      return <Badge variant="secondary" className="gap-1 text-xs bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3" />{'완료'}</Badge>
    case 0:
      return <Badge variant="default" className="gap-1 text-xs bg-blue-100 text-blue-800"><Clock className="w-3 h-3 animate-spin" />{'진행중'}</Badge>
    case 2:
      return <Badge variant="destructive" className="gap-1 text-xs"><AlertCircle className="w-3 h-3" />{'오류'}</Badge>
    case 3:
      return <Badge variant="secondary" className="gap-1 text-xs bg-gray-200 text-gray-700"><AlertCircle className="w-3 h-3" />{'중단'}</Badge>
    default:
      return <Badge variant="outline" className="text-xs">{CHECK_STATUS_LABEL[status] ?? '-'}</Badge>
  }
}

// 검증 현황 상세 (행 펼침 시 lazy fetch)
function ExecutionDetailRow({ checkId }: { checkId: number }) {
  const { data, loading, error } = useApi(
    (signal) => qcApi.getExecutionDetail(checkId, signal),
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
  if (error) {
    return <div className="text-xs text-red-600 py-3">{error}</div>
  }
  if (!data || data.length === 0) {
    return <div className="text-xs text-muted-foreground py-3">{'상세 내역이 없습니다.'}</div>
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground mb-2">{'단계별 상세'}</p>
      {data.map((detail, idx) => (
        <div key={idx} className="p-3 rounded-md border bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs font-medium">
                {STAGE_LABEL[detail.stage] ?? detail.stage}
              </Badge>
              <span className="text-xs text-muted-foreground">{'쿼리 '}{detail.queryCount}{'개'}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground">
                <span>{'시작: '}</span>
                <span className="font-mono">{detail.checkStartDatetime || '-'}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <span>{'종료: '}</span>
                <span className="font-mono">{detail.checkEndDatetime || '-'}</span>
              </div>
              {detail.score !== null && detail.score !== undefined ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{'점수:'}</span>
                  <span className={`text-sm font-bold ${getScoreColor(detail.score)}`}>
                    {detail.score}
                  </span>
                </div>
              ) : (
                getStatusBadge(detail.checkStatus)
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function QualityVerificationPage() {
  const [selectedDb, setSelectedDb] = useState<string>('')
  const [selectedSubStage, setSelectedSubStage] = useState<string>('')
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([])
  const [statisticsDetailLevel, setStatisticsDetailLevel] = useState<'simple' | 'detailed'>('simple')
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // 검증 현황 목록 (페이지네이션)
  const { data: executionsPage, loading, error, refetch } = useApi(
    (signal) => qcApi.getExecutions({ page: currentPage, size: ITEMS_PER_PAGE }, signal),
    [currentPage],
  )

  const executions = executionsPage?.items ?? []
  const totalCount = executionsPage?.totalCount ?? 0
  const totalPages = executionsPage?.totalPages ?? 1

  // 선택된 DB가 사전/본 개방 구분이 필요한지 (연계DB는 구분 안 함)
  const selectedDbInfo = databases.find((db) => db.id === selectedDb)
  const requiresSubStage = selectedDbInfo?.requiresSubStage ?? false

  // 검증 진행중(check_status=0) 건이 있으면 추가 트리거 차단
  const hasRunningVerification = executions.some((r) => r.checkStatus === 0)

  // DB 변경 시 하위 선택 초기화
  const handleDbChange = (dbId: string) => {
    setSelectedDb(dbId)
    setSelectedSubStage('')
    setSelectedIndicators([])
  }

  const toggleIndicator = (indicatorId: string) => {
    setSelectedIndicators((prev) =>
      prev.includes(indicatorId) ? prev.filter((id) => id !== indicatorId) : [...prev, indicatorId],
    )
  }

  const toggleRow = (rowId: number) => {
    setExpandedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId],
    )
  }

  // 실행 가능 여부: DB 선택 + 지표 선택 + (사전/본 개방 구분이 필요한 DB면 sub_stage도 선택)
  const canExecute =
    !!selectedDb && selectedIndicators.length > 0 && (!requiresSubStage || !!selectedSubStage)

  // 검증 실행 — DAG 트리거
  const handleExecute = async () => {
    if (hasRunningVerification) {
      alert('이전 검증이 실행 중입니다. 완료된 후 다시 실행해 주세요.')
      return
    }
    if (!canExecute || submitting) return

    // PREP/INTG/OPEN만 sub_stage 전송 (LINK은 구분 없음 → 생략)
    const body: DagRunRequest = {
      targetStage: selectedDb as Stage,
      ...(requiresSubStage ? { targetSubStage: selectedSubStage as DagRunRequest['targetSubStage'] } : {}),
    }

    setSubmitting(true)
    try {
      // 선택한 지표 유형별로 트리거 (품질 / 통계)
      const tasks: Promise<unknown>[] = []
      if (selectedIndicators.includes('quality')) tasks.push(qcApi.runQualityDag(body))
      if (selectedIndicators.includes('stats')) tasks.push(qcApi.runStatisticsDag(body))
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
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">{'품질검증 실행'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {'검증 대상 선택 및 품질/통계 지표 검증 실행'}
          </p>
        </div>

        {/* Selection Panel */}
        <div className="grid grid-cols-3 gap-4">
          {/* DB Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                {'1. 검증 대상 DB'}
              </CardTitle>
              <CardDescription className="text-xs">
                {'검증할 데이터베이스를 선택하세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {databases.map((db) => (
                  <div
                    key={db.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDb === db.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={() => handleDbChange(db.id)}
                  >
                    <div className="font-medium text-sm">{db.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{db.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sub-stage Selection (사전 개방 / 본 개방) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                {'2. 검증 대상 데이터'}
              </CardTitle>
              <CardDescription className="text-xs">
                {'사전 개방 / 본 개방을 선택하세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedDb ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  {'먼저 검증 대상 DB를 선택하세요'}
                </div>
              ) : !requiresSubStage ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  {'연계DB는 사전/본 개방 구분이 없습니다'}
                </div>
              ) : (
                <div className="space-y-2">
                  {subStages.map((sub) => (
                    <div
                      key={sub.id}
                      className={`flex items-center gap-2 p-3 rounded-md border-2 cursor-pointer transition-all ${
                        selectedSubStage === sub.id
                          ? 'bg-primary/10 border-primary'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedSubStage(sub.id)}
                    >
                      <Checkbox
                        checked={selectedSubStage === sub.id}
                        onCheckedChange={() => setSelectedSubStage(sub.id)}
                      />
                      <span className="text-sm">{sub.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Indicator Type Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                {'3. 검증 지표 유형'}
              </CardTitle>
              <CardDescription className="text-xs">
                {'실행할 지표 유형을 선택하세요'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!selectedDb || (requiresSubStage && !selectedSubStage) ? (
                <div className="text-sm text-muted-foreground text-center py-2">
                  {'먼저 검증 대상 DB / 데이터를 선택하세요'}
                </div>
              ) : (
                <div className="space-y-2">
                  {indicatorTypes.map((indicator) => {
                    const Icon = indicator.icon
                    const isStatistics = indicator.id === 'stats'
                    const isSelected = selectedIndicators.includes(indicator.id)
                    return (
                      <div
                        key={indicator.id}
                        className={`flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleIndicator(indicator.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleIndicator(indicator.id)}
                        />
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium flex-1">{indicator.name}</p>
                        {isStatistics && isSelected && (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <span className={`text-xs ${statisticsDetailLevel === 'simple' ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>{'간단'}</span>
                            <Switch
                              checked={statisticsDetailLevel === 'detailed'}
                              onCheckedChange={(checked) => setStatisticsDetailLevel(checked ? 'detailed' : 'simple')}
                            />
                            <span className={`text-xs ${statisticsDetailLevel === 'detailed' ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>{'상세'}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Execute Button */}
              <div className="pt-3 border-t">
                <Button
                  className="w-full gap-2"
                  disabled={!canExecute || hasRunningVerification || submitting}
                  onClick={handleExecute}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {'선택 항목 검증 실행'}
                </Button>
                {hasRunningVerification && (
                  <p className="text-xs text-yellow-600 text-center mt-2">
                    {'진행 중인 검증이 완료된 후 실행할 수 있습니다'}
                  </p>
                )}
                {canExecute && !hasRunningVerification && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {selectedDbInfo?.name}
                    {requiresSubStage && ` / ${subStages.find((s) => s.id === selectedSubStage)?.name}`}
                    {' / '}{selectedIndicators.length}{'개 지표'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification History Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{'검증 현황'}</CardTitle>
                <CardDescription className="text-sm">
                  {'최근 검증 실행 내역 (행을 클릭하여 상세 결과 확인)'}
                </CardDescription>
              </div>
              <p className="text-xs text-muted-foreground">{'총 '}{totalCount}{'건'}</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />{'불러오는 중...'}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-2 py-12">
                <p className="text-sm text-red-600">{error}</p>
                <Button variant="outline" size="sm" onClick={refetch}>{'다시 시도'}</Button>
              </div>
            ) : executions.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">{'검증 실행 내역이 없습니다.'}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8 text-xs"></TableHead>
                    <TableHead className="w-12 text-xs text-center">{'번호'}</TableHead>
                    <TableHead className="text-xs">DB</TableHead>
                    <TableHead className="text-xs">{'데이터'}</TableHead>
                    <TableHead className="text-xs">{'지표 유형'}</TableHead>
                    <TableHead className="text-xs">{'실행자'}</TableHead>
                    <TableHead className="text-xs">{'시작 일시'}</TableHead>
                    <TableHead className="text-xs">{'종료 일시'}</TableHead>
                    <TableHead className="text-xs">{'상태'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((row, index) => (
                    <Fragment key={row.checkId}>
                      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(row.checkId)}>
                        <TableCell className="text-center">
                          {expandedRows.includes(row.checkId) ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs font-medium text-muted-foreground">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </TableCell>
                        <TableCell className="text-xs font-medium">{STAGE_LABEL[row.stage] ?? row.stage}</TableCell>
                        <TableCell className="text-xs">{SUB_STAGE_LABEL[row.subStage] ?? (row.subStage || '-')}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline">{checkTypeLabel(row.checkType)}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {row.checkStatusFstWrt || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {row.checkStartDatetime || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {row.checkEndDatetime ? (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              {row.checkEndDatetime}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(row.checkStatus)}
                            {row.checkStatus === 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs gap-1"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.location.href = `/dashboard/quality-results?checkId=${row.checkId}`
                                }}
                              >
                                <ExternalLink className="w-3 h-3" />
                                {'결과 보기'}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {expandedRows.includes(row.checkId) && (
                        <TableRow key={`${row.checkId}-detail`} className="bg-muted/30">
                          <TableCell colSpan={9} className="p-4">
                            <ExecutionDetailRow checkId={row.checkId} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-xs text-muted-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}{' - '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}{' / '}{totalCount}{'건'}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    {'이전'}
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 w-7 text-xs p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    {'다음'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
