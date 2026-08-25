'use client'

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { Button } from '@/components/ui/button'

export const OVERLAY_CLASS =
  'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
export const CONTENT_CLASS =
  'bg-background fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg sm:max-w-sm'

/** 확인 팝업 — 확인을 누르면 onConfirm 이 끝날 때까지 버튼이 잠긴다 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '확인',
  pendingLabel = '처리 중...',
  destructive,
  pending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  confirmLabel?: string
  pendingLabel?: string
  destructive?: boolean
  pending?: boolean
  onConfirm: () => void
}) {
  return (
    <AlertDialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && pending) return
        onOpenChange(next)
      }}
    >
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className={OVERLAY_CLASS} />
        <AlertDialogPrimitive.Content className={CONTENT_CLASS}>
          <AlertDialogPrimitive.Title className="text-base font-semibold">
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
            {description}
          </AlertDialogPrimitive.Description>
          <div className="flex justify-end gap-2">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" size="sm" disabled={pending}>
                취소
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button
                size="sm"
                variant={destructive ? 'destructive' : 'default'}
                disabled={pending}
                onClick={(e) => {
                  e.preventDefault()
                  onConfirm()
                }}
              >
                {pending ? pendingLabel : confirmLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
