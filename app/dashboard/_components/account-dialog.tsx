'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Loader2, Trash2 } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError, ROLE_LABEL, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { LoginResponse } from '@/lib/api'

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{'계정'}</DialogTitle>
          </DialogHeader>

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
        </DialogContent>
      </Dialog>

      <WithdrawDialog
        open={withdrawOpen}
        withdrawing={withdrawing}
        email={me?.mberEmailAdres}
        value={withdrawEmail}
        onValueChange={setWithdrawEmail}
        onOpenChange={(nextOpen) => {
          if (withdrawing) return
          setWithdrawOpen(nextOpen)
          if (!nextOpen) setWithdrawEmail('')
        }}
        onConfirm={handleWithdraw}
      />
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

function WithdrawDialog({
  open,
  withdrawing,
  email,
  value,
  onValueChange,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  withdrawing: boolean
  email: string | undefined
  value: string
  onValueChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{'회원 탈퇴 확인'}</AlertDialogTitle>
          <AlertDialogDescription>
            {'회원 탈퇴를 진행하면 계정이 삭제되며 이 작업은 되돌릴 수 없습니다. 계속하려면 아래에 계정 이메일을 정확히 입력하세요.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="withdrawEmail" className="text-xs">
            {'계정 이메일'}
          </Label>
          <Input
            id="withdrawEmail"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={email ?? '이메일'}
            autoComplete="off"
            disabled={withdrawing}
          />
          <p className="text-xs text-muted-foreground">
            {'확인 이메일: '}
            <span className="font-medium text-foreground">{email ?? '-'}</span>
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={withdrawing}>{'취소'}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={!email || value.trim() !== email || withdrawing}
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
          >
            {withdrawing ? '탈퇴 처리 중...' : '회원 탈퇴'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
