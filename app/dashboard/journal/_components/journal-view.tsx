'use client'

import { useCallback, useState } from 'react'
import { FileDown, Loader2, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { RefreshingContent, TableStateRow } from '@/components/async-state'
import { TablePagerHeader } from '@/components/pager'
import { useApi } from '@/hooks/use-api'
import { useDebounced } from '@/hooks/use-debounced'
import {
  API_BASE_URL,
  generatedApi,
  unwrapGeneratedResult,
} from '@/lib/api'
import type { DqResultReview, DqRunLogResponse, PageResult } from '@/lib/api'
import { StageVersionPanel } from '../../quality-results/_components/stage-version-panel'
import { ColumnFilterHeader } from '../../indicators/_components/column-filter-header'
import { JournalRowGroup } from './journal-row-group'
import { ReviewFormDialog } from './review-form-dialog'
import { errMessage } from './journal-utils'

export function JournalView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DqResultReview | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DqResultReview | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const keyword = useDebounced(searchTerm.trim()) || undefined
  // 품질검증 결과 화면과 동일한 2단 선택 — null = 미선택, '' = 버전 구분 없는 단계(연계DB)
  const [stage, setStage] = useState<string | null>(null)
  const [subStage, setSubStage] = useState<string | null>(null)
  const [runFilter, setRunFilter] = useState('all')
  const ready = !!stage && subStage !== null
  const runId = runFilter === 'all' ? undefined : Number(runFilter)

  // 검증ID 필터 옵션 — 선택한 DB 단계의 검증 실행 이력에서 도출
  const runsApi = useApi(
    async (signal) => {
      if (!ready) return null
      return unwrapGeneratedResult<PageResult<DqRunLogResponse>>(
        await generatedApi.GET('/api/qc/quality-results/checks', {
          params: {
            query: {
              stage: stage ?? undefined,
              subStage: subStage || undefined,
              page: 1,
              size: 100, // ponytail: 최근 100회차까지만 필터 옵션 제공, 더 필요하면 서버 distinct runId API 추가
            },
          },
          signal,
        }),
      )
    },
    [ready, stage, subStage],
  )
  const runOptions = (runsApi.data?.items ?? []).map((r) => ({
    value: String(r.runId),
    label: String(r.runId),
  }))

  const handleSelectStage = (nextStage: string, nextSub: string | null) => {
    setStage(nextStage)
    setSubStage(nextSub)
    setRunFilter('all')
    resetList()
  }

  const { data, isInitialLoading, isRefetching, error, refetch } = useApi(
    async (signal) => {
      if (!ready) return null
      return unwrapGeneratedResult<PageResult<DqResultReview>>(
        await generatedApi.GET('/api/qc/result-journals', {
          params: {
            query: {
              stage: stage ?? undefined,
              subStage: subStage || undefined,
              runId,
              keyword,
              page,
              size: pageSize,
            },
          },
          signal,
        }),
      )
    },
    [ready, stage, subStage, runId, keyword, page, pageSize],
  )

  const reviews = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  const resetList = () => {
    setPage(1)
    setExpandedId(null)
  }

  // memo 된 JournalRowGroup 에 안정된 참조를 넘긴다
  const handleEdit = useCallback((r: DqResultReview) => setEditTarget(r), [])
  const handleDelete = useCallback((r: DqResultReview) => setDeleteTarget(r), [])

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await unwrapGeneratedResult(
        await generatedApi.DELETE('/api/qc/result-journals/{reviewId}', {
          params: { path: { reviewId: deleteTarget.reviewId! } },
        }),
      )
      if (expandedId === deleteTarget.reviewId) setExpandedId(null)
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      alert(errMessage(err, '일지 삭제에 실패했습니다.'))
    } finally {
      setDeleting(false)
    }
  }

  // 서버 export 는 stage·subStage·runId 필터만 지원한다 (검색어 미적용)
  const exportCsv = async () => {
    if (!ready) return
    setExporting(true)
    try {
      const qs = new URLSearchParams({ stage: stage! })
      if (subStage) qs.set('subStage', subStage)
      if (runId !== undefined) qs.set('runId', String(runId))
      const res = await fetch(
        `${API_BASE_URL}/api/qc/result-journals/export?${qs}`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? '엑셀 추출에 실패했습니다.')
      }
      const url = URL.createObjectURL(await res.blob())
      const a = document.createElement('a')
      a.href = url
      a.download = 'result_journal.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(errMessage(err, '엑셀 추출에 실패했습니다.'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="container mx-auto space-y-6 px-6 py-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold leading-[34px]">
              {'품질검증 결과 검토'}
            </h1>
            <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
              {'품질검증 결과에 대한 검토와 조치 내역을 기록하고 관리합니다'}
            </p>
          </div>
          <Button className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus />
            {'일지 작성'}
          </Button>
        </div>

        <StageVersionPanel
          selectedStage={stage}
          selectedSubStage={subStage}
          onSelect={handleSelectStage}
        />

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="지표ID, 세부지표ID, 배정팀, 검토자 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                resetList()
              }}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            className="gap-1.5"
            disabled={exporting || !ready}
            onClick={exportCsv}
            title="선택한 DB 단계의 검토+조치를 CSV로 추출합니다 (검증ID 필터 적용)"
          >
            {exporting ? <Loader2 className="animate-spin" /> : <FileDown />}
            {'엑셀 추출'}
          </Button>
        </div>

        <ReviewFormDialog
          // 대상이 바뀌면 remount 시켜 폼을 새 값으로 초기화한다
          key={editTarget?.reviewId ?? 'new'}
          open={addOpen || editTarget !== null}
          onOpenChange={(next) => {
            if (next) return
            setAddOpen(false)
            setEditTarget(null)
          }}
          review={editTarget}
          onSaved={refetch}
        />

        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(next) => {
            if (!next) setDeleteTarget(null)
          }}
          title="일지 삭제"
          description="이 일지를 삭제하면 하위 조치도 함께 목록에서 제외됩니다. 계속하시겠습니까?"
          confirmLabel="삭제"
          pendingLabel="삭제 중..."
          destructive
          pending={deleting}
          onConfirm={confirmDelete}
        />

        <Card>
          <TablePagerHeader
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            totalLabel={`총 ${totalCount}건`}
            onChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              resetList()
            }}
          />
          <CardContent className="p-0">
            <RefreshingContent isRefetching={isRefetching}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead className="w-20 text-xs">{'상태'}</TableHead>
                    <TableHead className="w-24 px-1 text-xs">
                      <ColumnFilterHeader
                        label="검증ID"
                        allLabel="전체 검증ID"
                        value={runFilter}
                        onChange={(v) => {
                          setRunFilter(v)
                          resetList()
                        }}
                        options={runOptions}
                      />
                    </TableHead>
                    <TableHead className="text-xs">{'지표ID'}</TableHead>
                    <TableHead className="text-xs">{'세부지표ID'}</TableHead>
                    <TableHead className="text-xs">{'배정 팀'}</TableHead>
                    <TableHead className="text-xs">{'검토자'}</TableHead>
                    <TableHead className="text-xs">{'검토 일시'}</TableHead>
                    <TableHead className="w-20 text-xs">{'관리'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.length === 0 ? (
                    <TableStateRow
                      colSpan={9}
                      loading={isInitialLoading}
                      error={error}
                      empty={!isInitialLoading && !error}
                      emptyMessage={
                        ready
                          ? '등록된 일지가 없습니다.'
                          : '먼저 조회 대상 DB와 데이터를 선택하세요'
                      }
                      onRetry={refetch}
                    />
                  ) : (
                    reviews.map((review) => (
                      <JournalRowGroup
                        key={review.reviewId}
                        review={review}
                        expanded={expandedId === review.reviewId}
                        onToggle={() =>
                          setExpandedId(
                            expandedId === review.reviewId
                              ? null
                              : review.reviewId!,
                          )
                        }
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </RefreshingContent>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
