'use client'

import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ApiError } from '@/lib/api'

/** 활성/비활성 체크박스 — 변경 시 확인 팝업 → 저장 (백엔드 미구현이면 에러 메시지) */
export function ActiveToggleCell({
  active: initialActive,
  label,
  onSave,
}: {
  active: boolean
  label: string
  onSave: (next: boolean) => Promise<void>
}) {
  const [active, setActive] = useState(initialActive)
  const [pending, setPending] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => setActive(initialActive), [initialActive])

  const confirm = async () => {
    if (pending == null) return
    setSaving(true)
    try {
      await onSave(pending)
      setActive(pending)
      setPending(null)
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
          if (!open) setPending(null)
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
        onConfirm={confirm}
      />
    </div>
  )
}
