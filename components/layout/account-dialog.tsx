'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { KeyRound, Loader2, Trash2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ApiError, ROLE_LABEL, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { LoginResponse } from '@/lib/api'

// 오버레이/콘텐츠 공통 클래스 (Dialog · AlertDialog 공용)
const OVERLAY_CLASS =
  'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
const CONTENT_CLASS =
  'bg-background fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg sm:max-w-md'

interface AccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  me: LoginResponse | null | undefined
  onChanged: () => void
}

export function AccountDialog({ open, onOpenChange, me, onChanged }: AccountDialogProps) {
  const router = useRouter()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawEmail, setWithdrawEmail] = useState('')

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (newPassword.length < 8 || newPassword.length > 50) {
      setPasswordError('새 비밀번호는 8자 이상 50자 이하여야 합니다.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.')
      return
    }

    setPasswordSubmitting(true)
    try {
      await unwrapGeneratedResult(
        await generatedApi.POST('/api/members/me/password', {
          body: { oldPassword, newPassword },
        }),
      )
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onChanged()
      alert('비밀번호가 변경되었습니다.')
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : '비밀번호 변경에 실패했습니다.')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!me || withdrawEmail.trim() !== me.mberEmailAdres) return

    setWithdrawing(true)
    try {
      await unwrapGeneratedResult(await generatedApi.DELETE('/api/members/me'))
      setWithdrawOpen(false)
      setWithdrawEmail('')
      alert('회원 탈퇴가 완료되었습니다.')
      router.push('/')
    } catch (err) {
      alert(err instanceof ApiError ? err.message : '회원 탈퇴에 실패했습니다.')
      setWithdrawing(false)
    }
  }

  return (
    <>
      {/* 계정 모달 (Radix Dialog 직접 구성) */}
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className={OVERLAY_CLASS} />
          <DialogPrimitive.Content className={cn(CONTENT_CLASS, 'max-h-[85vh] overflow-y-auto')}>
            <DialogPrimitive.Title className="text-lg font-semibold">{'계정'}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {'계정 정보 확인 및 비밀번호 변경 · 회원 탈퇴'}
            </DialogPrimitive.Description>

            <AccountInfo me={me} />

            <form onSubmit={handleChangePassword} className="space-y-3 pt-4 border-t">
              <p className="text-sm font-semibold">{'비밀번호 변경'}</p>
              <PasswordField id="oldPassword" label="현재 비밀번호" value={oldPassword} onChange={setOldPassword} autoComplete="current-password" />
              <PasswordField id="newPassword" label="새 비밀번호 (8~50자)" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
              <PasswordField id="confirmPassword" label="새 비밀번호 확인" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
              {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
              <Button
                type="submit"
                variant="outline"
                disabled={passwordSubmitting || !oldPassword || !newPassword || !confirmPassword}
                className="w-full gap-2"
              >
                {passwordSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                {'비밀번호 변경'}
              </Button>
            </form>

            <div className="pt-3 border-t flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={withdrawing}
                onClick={() => setWithdrawOpen(true)}
                className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {withdrawing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {'회원 탈퇴'}
              </Button>
            </div>

            <DialogPrimitive.Close
              className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* 회원 탈퇴 확인 (Radix AlertDialog 직접 구성) */}
      <AlertDialogPrimitive.Root
        open={withdrawOpen}
        onOpenChange={(nextOpen) => {
          if (withdrawing) return
          setWithdrawOpen(nextOpen)
          if (!nextOpen) setWithdrawEmail('')
        }}
      >
        <AlertDialogPrimitive.Portal>
          <AlertDialogPrimitive.Overlay className={OVERLAY_CLASS} />
          <AlertDialogPrimitive.Content className={CONTENT_CLASS}>
            <AlertDialogPrimitive.Title className="text-lg font-semibold">
              {'회원 탈퇴 확인'}
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
              {'회원 탈퇴를 진행하면 계정이 삭제되며 이 작업은 되돌릴 수 없습니다. 계속하려면 아래에 계정 이메일을 정확히 입력하세요.'}
            </AlertDialogPrimitive.Description>

            <div className="space-y-2">
              <Label htmlFor="withdrawEmail" className="text-xs">{'계정 이메일'}</Label>
              <Input
                id="withdrawEmail"
                value={withdrawEmail}
                onChange={(e) => setWithdrawEmail(e.target.value)}
                placeholder={me?.mberEmailAdres ?? '이메일'}
                autoComplete="off"
                disabled={withdrawing}
              />
              <p className="text-xs text-muted-foreground">
                {'확인 이메일: '}
                <span className="font-medium text-foreground">{me?.mberEmailAdres ?? '-'}</span>
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <AlertDialogPrimitive.Cancel asChild>
                <Button variant="outline" size="sm" disabled={withdrawing}>
                  {'취소'}
                </Button>
              </AlertDialogPrimitive.Cancel>
              <AlertDialogPrimitive.Action asChild>
                <Button
                  size="sm"
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={!me?.mberEmailAdres || withdrawEmail.trim() !== me?.mberEmailAdres || withdrawing}
                  onClick={(e) => {
                    e.preventDefault()
                    handleWithdraw()
                  }}
                >
                  {withdrawing ? '탈퇴 처리 중...' : '회원 탈퇴'}
                </Button>
              </AlertDialogPrimitive.Action>
            </div>
          </AlertDialogPrimitive.Content>
        </AlertDialogPrimitive.Portal>
      </AlertDialogPrimitive.Root>
    </>
  )
}

function AccountInfo({ me }: { me: LoginResponse | null | undefined }) {
  if (!me) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        {'사용자 정보를 불러오는 중...'}
      </p>
    )
  }

  return (
    <div className="space-y-2 text-sm">
      <InfoRow label="아이디" value={me.mberId} />
      <InfoRow label="이름" value={me.mberNm} />
      <InfoRow label="이메일" value={me.mberEmailAdres} />
      <InfoRow label="소속" value={me.aflcoNm} />
      <div className="flex items-center justify-between p-2 rounded bg-muted/40">
        <span className="text-muted-foreground">{'권한'}</span>
        <Badge variant="secondary" className="text-xs">
          {ROLE_LABEL[me.role] ?? me.role}
        </Badge>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded bg-muted/40">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right break-all">{value}</span>
    </div>
  )
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input
        id={id}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="h-9"
      />
    </div>
  )
}
