'use client'

import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OVERLAY_CLASS } from '@/components/confirm-dialog'
import { useApi } from '@/hooks/use-api'
import { generatedApi, runTypeLabel, unwrapGeneratedResult } from '@/lib/api'
import type {
  DqResultReview,
  PageResult,
  ResultReviewRequest,
  RunExecutionResponse,
} from '@/lib/api'
import {
  blankToUndefined,
  errMessage,
  fromInputDatetime,
  toInputDatetime,
} from './journal-utils'

function RequiredMark() {
  return <span className="text-destructive ml-0.5">{'*'}</span>
}

/** 검토(review) 작성/수정 — review 가 있으면 수정 모드. 대상(검증ID·지표ID·세부지표ID)은 수정도 가능하다. */
export function ReviewFormDialog({
  open,
  onOpenChange,
  review,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  review: DqResultReview | null
  onSaved: () => void
}) {
  const isEdit = review !== null
  const [runId, setRunId] = useState(review?.runId ? String(review.runId) : '')
  const [metricId, setMetricId] = useState(review?.metricId ?? '')
  const [ruleCheckId, setRuleCheckId] = useState(review?.ruleCheckId ?? '')
  const [reviewer, setReviewer] = useState(review?.reviewer ?? '')
  const [assignedTeam, setAssignedTeam] = useState(review?.assignedTeam ?? '')
  const [reviewDatetime, setReviewDatetime] = useState(
    toInputDatetime(review?.reviewDatetime),
  )
  const [reviewContent, setReviewContent] = useState(
    review?.reviewContent ?? '',
  )
  const [opinion1, setOpinion1] = useState(review?.reviewOpinion1st ?? '')
  const [opinion2, setOpinion2] = useState(review?.reviewOpinion2nd ?? '')
  const [opinion3, setOpinion3] = useState(review?.reviewOpinion3rd ?? '')
  const [reviewResult, setReviewResult] = useState(review?.reviewResult ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ponytail: 최근 100개 실행만 선택 가능 — 더 오래된 회차가 필요하면 검색형 피커로
  const { data: runs } = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<RunExecutionResponse>>(
        await generatedApi.GET('/api/qc/executions', {
          params: { query: { page: 1, size: 100 } },
          signal,
        }),
      ),
    [],
  )

  const valid = runId !== '' && metricId.trim() !== '' && ruleCheckId.trim() !== ''

  const save = async () => {
    setSaving(true)
    setError(null)
    const body: ResultReviewRequest = {
      runId: Number(runId),
      metricId: metricId.trim(),
      ruleCheckId: ruleCheckId.trim(),
      reviewer: blankToUndefined(reviewer),
      assignedTeam: blankToUndefined(assignedTeam),
      reviewDatetime: fromInputDatetime(reviewDatetime),
      reviewContent: blankToUndefined(reviewContent),
      reviewOpinion1st: blankToUndefined(opinion1),
      reviewOpinion2nd: blankToUndefined(opinion2),
      reviewOpinion3rd: blankToUndefined(opinion3),
      reviewResult: blankToUndefined(reviewResult),
    }
    try {
      if (isEdit) {
        await unwrapGeneratedResult(
          await generatedApi.PUT('/api/qc/result-journals/{reviewId}', {
            params: { path: { reviewId: review.reviewId! } },
            body,
          }),
        )
      } else {
        await unwrapGeneratedResult(
          await generatedApi.POST('/api/qc/result-journals', { body }),
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
              {isEdit ? '일지 수정' : '일지 작성'}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              {'검증 결과에 대한 검토 내용을 기록합니다. 조치는 저장 후 목록에서 추가합니다.'}
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
                  {'검증ID(회차)'}
                  <RequiredMark />
                </Label>
                <Select value={runId || undefined} onValueChange={setRunId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* 수정 대상 회차가 최근 100개 밖이어도 현재 값은 보이도록 한다 */}
                    {runId &&
                      !runs?.items?.some((r) => String(r.runId) === runId) && (
                        <SelectItem value={runId}>{`#${runId}`}</SelectItem>
                      )}
                    {runs?.items?.map((r) => (
                      <SelectItem key={r.runId} value={String(r.runId)}>
                        {`#${r.runId} · ${runTypeLabel(r.runType ?? '')} · ${r.subStage ?? r.stage ?? ''}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {'지표ID'}
                  <RequiredMark />
                </Label>
                <Input
                  value={metricId}
                  onChange={(e) => setMetricId(e.target.value)}
                  placeholder="예: QM101"
                  className="h-9 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  {'세부지표ID'}
                  <RequiredMark />
                </Label>
                <Input
                  value={ruleCheckId}
                  onChange={(e) => setRuleCheckId(e.target.value)}
                  placeholder="예: QM101-01"
                  className="h-9 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{'검토 일시'}</Label>
                <Input
                  type="datetime-local"
                  value={reviewDatetime}
                  onChange={(e) => setReviewDatetime(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{'검토자'}</Label>
                <Input
                  value={reviewer}
                  onChange={(e) => setReviewer(e.target.value)}
                  placeholder="예: 홍길동"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{'배정 팀'}</Label>
                <Input
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  placeholder="예: 데이터품질팀"
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{'검토 내용'}</Label>
              <Textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="검토 내용을 입력하세요"
              />
            </div>
            {(
              [
                ['1차 검토 의견', opinion1, setOpinion1],
                ['2차 검토 의견', opinion2, setOpinion2],
                ['3차 검토 의견', opinion3, setOpinion3],
                ['검토 결과', reviewResult, setReviewResult],
              ] as const
            ).map(([label, value, set]) => (
              <div key={label} className="space-y-1.5">
                <Label className="text-xs">{label}</Label>
                <Textarea
                  value={value}
                  onChange={(e) => set(e.target.value)}
                />
              </div>
            ))}
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
