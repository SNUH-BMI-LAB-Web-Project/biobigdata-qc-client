'use client'

import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ApiError } from '@/lib/api'

/**
 * 활성/비활성 체크박스 — 변경 시 확인 팝업 → 저장 (백엔드 미구현이면 에러 메시지).
 * requireReasonOnDeactivate: 비활성 전환 시 사유 입력을 필수로 받아 onSave 두 번째 인자로 넘긴다.
 */
export function ActiveToggleCell({
  active: initialActive,
  label,
  onSave,
  requireReasonOnDeactivate,
}: {
  active: boolean
  label: string
  onSave: (next: boolean, reason?: string) => Promise<void>
  requireReasonOnDeactivate?: boolean
}) {
  const [active, setActive] = useState(initialActive)
  const [pending, setPending] = useState<boolean | null>(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => setActive(initialActive), [initialActive])

  const needReason = requireReasonOnDeactivate && pending === false
  const trimmed = reason.trim()

  const close = () => {
    setPending(null)
    setReason('')
  }

  const confirm = async () => {
    if (pending == null) return
    setSaving(true)
    try {
      await onSave(pending, needReason ? trimmed : undefined)
      setActive(pending)
      close()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '상태 변경에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox
        checked={active}
        onCheckedChange={(next) => setPending(!!next)}
      />
      <span
        className={`text-xs ${active ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        {active ? '활성' : '비활성'}
      </span>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) close()
        }}
        title={`${label} 상태 변경`}
        description={
          <>
            {label}을(를){' '}
            <b className="text-foreground">{pending ? '활성' : '비활성'}</b>{' '}
            상태로 변경하시겠습니까?
          </>
        }
        pendingLabel="저장 중..."
        pending={saving}
        confirmDisabled={needReason && !trimmed}
        onConfirm={confirm}
      >
        {needReason && (
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">
              비활성 사유 <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="비활성 사유를 입력하세요"
              rows={3}
              className="text-sm"
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  )
}
