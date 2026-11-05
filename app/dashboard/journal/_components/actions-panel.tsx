'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { TableStateRow } from '@/components/async-state'
import { useApi } from '@/hooks/use-api'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { DqResultAction, ResultJournalResponse } from '@/lib/api'
import { ActionFormDialog } from './action-form-dialog'
import { errMessage, shortDatetime } from './journal-utils'

const REVIEW_TEXT_FIELDS = [
  ['reviewContent', '검토 내용'],
  ['reviewOpinion1st', '1차 의견'],
  ['reviewOpinion2nd', '2차 의견'],
  ['reviewOpinion3rd', '3차 의견'],
  ['reviewResult', '검토 결과'],
] as const

/** 펼친 검토 행 — 검토 상세 텍스트 + 하위 조치 목록(작성/수정/삭제). */
export function ActionsPanel({ reviewId }: { reviewId: number }) {
  const { data, isInitialLoading, error, refetch } = useApi(
    async (signal) =>
      unwrapGeneratedResult<ResultJournalResponse>(
        await generatedApi.GET('/api/qc/result-journals/{reviewId}', {
          params: { path: { reviewId } },
          signal,
        }),
      ),
    [reviewId],
  )
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DqResultAction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DqResultAction | null>(null)
  const [deleting, setDeleting] = useState(false)

  const review = data?.review
  const actions = data?.actions ?? []
  const nextIssueNo = Math.max(0, ...actions.map((a) => a.issueNo ?? 0)) + 1

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await unwrapGeneratedResult(
        await generatedApi.DELETE('/api/qc/result-journals/actions/{actionId}', {
          params: { path: { actionId: deleteTarget.actionId! } },
        }),
      )
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      alert(errMessage(err, '조치 삭제에 실패했습니다.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4 p-4">
      {review && REVIEW_TEXT_FIELDS.some(([k]) => review[k]) && (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-xs md:grid-cols-2">
          {REVIEW_TEXT_FIELDS.filter(([k]) => review[k]).map(([k, label]) => (
            <div key={k}>
              <dt className="font-semibold text-muted-foreground">{label}</dt>
              <dd className="whitespace-pre-wrap break-words">{review[k]}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{`조치 ${actions.length}건`}</h3>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={!review}
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-4" />
          {'조치 추가'}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">{'처리부서'}</TableHead>
              <TableHead className="text-xs">{'수정유형'}</TableHead>
              <TableHead className="text-xs">{'수정 대상 테이블'}</TableHead>
              <TableHead className="text-xs">{'수정 대상 기관'}</TableHead>
              <TableHead className="text-xs">{'오류 설명'}</TableHead>
              <TableHead className="text-xs">{'수정 규칙 발생 원인'}</TableHead>
              <TableHead className="text-xs">{'수정 요청일시'}</TableHead>
              <TableHead className="text-xs">{'요청자'}</TableHead>
              <TableHead className="text-xs">{'확인일시'}</TableHead>
              <TableHead className="text-xs">{'확인자'}</TableHead>
              <TableHead className="w-20 text-xs">{'관리'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.length === 0 ? (
              <TableStateRow
                colSpan={11}
                loading={isInitialLoading}
                error={error}
                empty={!isInitialLoading && !error}
                emptyMessage="등록된 조치가 없습니다."
                onRetry={refetch}
              />
            ) : (
              actions.map((a) => (
                <TableRow key={a.actionId}>
                  <TableCell className="text-xs">{a.actionTeam}</TableCell>
                  <TableCell className="text-xs">{a.actionType}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {a.errorTableName ?? '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {a.errorInstitution ?? '-'}
                  </TableCell>
                  <TableCell
                    className="max-w-56 truncate text-xs"
                    title={a.errorDescription}
                  >
                    {a.errorDescription}
                  </TableCell>
                  <TableCell
                    className="max-w-56 truncate text-xs"
                    title={a.errorCause}
                  >
                    {a.errorCause ?? '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {shortDatetime(a.requestedAt)}
                  </TableCell>
                  <TableCell className="text-xs">{a.requestedBy}</TableCell>
                  <TableCell className="text-xs">
                    {shortDatetime(a.confirmedAt)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {a.confirmedBy ?? '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        aria-label="조치 수정"
                        title="수정"
                        onClick={() => setEditTarget(a)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        aria-label="조치 삭제"
                        title="삭제"
                        onClick={() => setDeleteTarget(a)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ActionFormDialog
        // 대상이 바뀌면 remount 시켜 폼을 새 값으로 초기화한다
        key={editTarget?.actionId ?? 'new'}
        open={addOpen || editTarget !== null}
        onOpenChange={(next) => {
          if (next) return
          setAddOpen(false)
          setEditTarget(null)
        }}
        reviewId={reviewId}
        action={editTarget}
        nextIssueNo={nextIssueNo}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null)
        }}
        title="조치 삭제"
        description="이 조치를 삭제하면 목록에서 제외됩니다. 계속하시겠습니까?"
        confirmLabel="삭제"
        pendingLabel="삭제 중..."
        destructive
        pending={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
