'use client'

import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { OVERLAY_CLASS } from '@/components/confirm-dialog'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { DqResultAction, ResultActionRequest } from '@/lib/api'
import {
  ACTION_TYPE_SUGGESTIONS,
  blankToUndefined,
  errMessage,
  fromInputDatetime,
  toInputDatetime,
} from './journal-utils'

function RequiredMark() {
  return <span className="text-destructive ml-0.5">{'*'}</span>
}

/** 조치(action) 작성/수정 — action 이 있으면 수정 모드. 이슈 번호는 작성 시 자동 부여(nextIssueNo), 수정 시 유지. */
export function ActionFormDialog({
  open,
  onOpenChange,
  reviewId,
  action,
  nextIssueNo,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  reviewId: number
  action: DqResultAction | null
  nextIssueNo: number
  onSaved: () => void
}) {
  const isEdit = action !== null
  const [actionTeam, setActionTeam] = useState(action?.actionTeam ?? '')
  const [actionType, setActionType] = useState(action?.actionType ?? '')
  const [errorDescription, setErrorDescription] = useState(
    action?.errorDescription ?? '',
  )
  const [errorTableName, setErrorTableName] = useState(
    action?.errorTableName ?? '',
  )
  const [errorInstitution, setErrorInstitution] = useState(
    action?.errorInstitution ?? '',
  )
  const [errorCause, setErrorCause] = useState(action?.errorCause ?? '')
  const [requestedAt, setRequestedAt] = useState(
    toInputDatetime(action?.requestedAt),
  )
  const [requestedBy, setRequestedBy] = useState(action?.requestedBy ?? '')
  const [actionRule, setActionRule] = useState(action?.actionRule ?? '')
  const [actionTargetSql, setActionTargetSql] = useState(
    action?.actionTargetSql ?? '',
  )
  const [actionTargetRows, setActionTargetRows] = useState(
    action?.actionTargetRows != null ? String(action.actionTargetRows) : '',
  )
  const [vendorLogId, setVendorLogId] = useState(action?.vendorLogId ?? '')
  const [confirmedAt, setConfirmedAt] = useState(
    toInputDatetime(action?.confirmedAt),
  )
  const [confirmedBy, setConfirmedBy] = useState(action?.confirmedBy ?? '')
  const [confirmResult, setConfirmResult] = useState(
    action?.confirmResult ?? '',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valid =
    actionTeam.trim() !== '' &&
    actionType.trim() !== '' &&
    errorDescription.trim() !== '' &&
    requestedAt !== '' &&
    requestedBy.trim() !== ''

  const save = async () => {
    setSaving(true)
    setError(null)
    const body: ResultActionRequest = {
      issueNo: action?.issueNo ?? nextIssueNo,
      actionTeam: actionTeam.trim(),
      actionType: actionType.trim(),
      errorDescription: errorDescription.trim(),
      requestedAt: fromInputDatetime(requestedAt)!,
      requestedBy: requestedBy.trim(),
      errorTableName: blankToUndefined(errorTableName),
      errorInstitution: blankToUndefined(errorInstitution),
      errorCause: blankToUndefined(errorCause),
      actionRule: blankToUndefined(actionRule),
      actionTargetSql: blankToUndefined(actionTargetSql),
      actionTargetRows:
        actionTargetRows.trim() === '' ? undefined : Number(actionTargetRows),
      vendorLogId: blankToUndefined(vendorLogId),
      confirmedAt: fromInputDatetime(confirmedAt),
      confirmedBy: blankToUndefined(confirmedBy),
      confirmResult: blankToUndefined(confirmResult),
    }
    try {
      if (isEdit) {
        await unwrapGeneratedResult(
          await generatedApi.PUT('/api/qc/result-journals/actions/{actionId}', {
            params: { path: { actionId: action.actionId! } },
            body,
          }),
        )
      } else {
        await unwrapGeneratedResult(
          await generatedApi.POST('/api/qc/result-journals/{reviewId}/actions', {
            params: { path: { reviewId } },
            body,
          }),
        )
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      setError(errMessage(err, '저장에 실패했습니다.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => !saving && onOpenChange(next)}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={OVERLAY_CLASS} />
        <DialogPrimitive.Content className="bg-background fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border shadow-lg sm:max-w-2xl">
          <div className="px-6 pt-6 pb-4">
            <DialogPrimitive.Title className="text-lg font-semibold">
              {isEdit ? '조치 수정' : '조치 추가'}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              {'오류에 대한 수정 요청과 처리 내역을 기록합니다.'}
            </DialogPrimitive.Description>
            <DialogPrimitive.Close
              className="absolute top-4 right-4 opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {'처리부서'}
                  <RequiredMark />
                </Label>
                <Input
                  value={actionTeam}
                  onChange={(e) => setActionTeam(e.target.value)}
                  placeholder="예: 데이터품질팀"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {'수정유형'}
                  <RequiredMark />
                </Label>
                <Input
                  list="journal-action-types"
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  placeholder="예: 데이터 수정"
                  className="h-9"
                />
                <datalist id="journal-action-types">
                  {ACTION_TYPE_SUGGESTIONS.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{'수정 대상 테이블'}</Label>
                <Input
                  value={errorTableName}
                  onChange={(e) => setErrorTableName(e.target.value)}
                  placeholder="예: patients"
                  className="h-9 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{'수정 대상 기관'}</Label>
                <Input
                  value={errorInstitution}
                  onChange={(e) => setErrorInstitution(e.target.value)}
                  placeholder="예: OO대학병원"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {'수정 요청 일시'}
                  <RequiredMark />
                </Label>
                <Input
                  type="datetime-local"
                  value={requestedAt}
                  onChange={(e) => setRequestedAt(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {'요청자'}
                  <RequiredMark />
                </Label>
                <Input
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  placeholder="예: 홍길동"
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                {'오류 설명'}
                <RequiredMark />
              </Label>
              <Textarea
                value={errorDescription}
                onChange={(e) => setErrorDescription(e.target.value)}
                placeholder="발견된 오류를 입력하세요"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{'수정 규칙 발생 원인'}</Label>
              <Textarea
                value={errorCause}
                onChange={(e) => setErrorCause(e.target.value)}
                placeholder="수정 규칙이 발생한 원인을 입력하세요"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{'수정 규칙'}</Label>
              <Textarea
                value={actionRule}
                onChange={(e) => setActionRule(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{'수정 대상 SQL'}</Label>
              <Textarea
                value={actionTargetSql}
                onChange={(e) => setActionTargetSql(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{'수정 대상 행 수'}</Label>
                <Input
                  type="number"
                  min={0}
                  value={actionTargetRows}
                  onChange={(e) => setActionTargetRows(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{'업체 로그 ID'}</Label>
                <Input
                  value={vendorLogId}
                  onChange={(e) => setVendorLogId(e.target.value)}
                  className="h-9 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{'확인 일시'}</Label>
                <Input
                  type="datetime-local"
                  value={confirmedAt}
                  onChange={(e) => setConfirmedAt(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{'확인자'}</Label>
                <Input
                  value={confirmedBy}
                  onChange={(e) => setConfirmedBy(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{'확인 결과'}</Label>
              <Textarea
                value={confirmResult}
                onChange={(e) => setConfirmResult(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t px-6 py-3">
            {error && (
              <p className="mr-auto text-sm text-destructive">{error}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              {'취소'}
            </Button>
            <Button size="sm" disabled={!valid || saving} onClick={save}>
              {saving && <Loader2 className="animate-spin" />}
              {isEdit ? '수정' : '저장'}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
