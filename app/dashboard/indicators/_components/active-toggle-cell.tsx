'use client'

import { useEffect, useState } from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ApiError } from '@/lib/api'

const OVERLAY_CLASS =
  'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
const CONTENT_CLASS =
  'bg-background fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg sm:max-w-sm'

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
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Checkbox checked={active} onCheckedChange={(next) => setPending(!!next)} />
      <span className={`text-xs ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
        {active ? '활성' : '비활성'}
      </span>

      <AlertDialogPrimitive.Root
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !saving) setPending(null)
        }}
      >
        <AlertDialogPrimitive.Portal>
          <AlertDialogPrimitive.Overlay className={OVERLAY_CLASS} />
          <AlertDialogPrimitive.Content className={CONTENT_CLASS}>
            <AlertDialogPrimitive.Title className="text-base font-semibold">
              {label} 상태 변경
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
              {label}을(를) <b className="text-foreground">{pending ? '활성' : '비활성'}</b> 상태로 변경하시겠습니까?
            </AlertDialogPrimitive.Description>
            <div className="flex justify-end gap-2">
              <AlertDialogPrimitive.Cancel asChild>
                <Button variant="outline" size="sm" disabled={saving}>
                  취소
                </Button>
              </AlertDialogPrimitive.Cancel>
              <AlertDialogPrimitive.Action asChild>
                <Button
                  size="sm"
                  disabled={saving}
                  onClick={(e) => {
                    e.preventDefault()
                    confirm()
                  }}
                >
                  {saving ? '저장 중...' : '확인'}
                </Button>
              </AlertDialogPrimitive.Action>
            </div>
          </AlertDialogPrimitive.Content>
        </AlertDialogPrimitive.Portal>
      </AlertDialogPrimitive.Root>
    </div>
  )
}
