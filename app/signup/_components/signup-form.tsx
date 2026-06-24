'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Lock, User, Mail, Building2, BadgeCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { ApiError, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { Role } from '@/lib/api'

type IdCheck = 'idle' | 'checking' | 'available' | 'duplicate'

/** 회원가입 입력 폼 — ID 중복확인 + 유효성 검사 + 가입 신청. 성공 시 onDone 호출 */
export function SignupForm({ onDone }: { onDone: () => void }) {
  const [mberId, setMberId] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [mberNm, setMberNm] = useState('')
  const [mberEmailAdres, setMberEmailAdres] = useState('')
  const [aflcoNm, setAflcoNm] = useState('')
  const [role, setRole] = useState<Role>('VIEWER')

  const [idCheck, setIdCheck] = useState<IdCheck>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const idValid = mberId.length >= 4
  const pwValid = password.length >= 8
  const pwMatch = password === passwordConfirm && passwordConfirm.length > 0
  const canSubmit =
    idValid && pwValid && pwMatch && mberNm.trim().length > 0 && idCheck === 'available'

  const handleCheckId = async () => {
    if (!idValid) return
    setIdCheck('checking')
    try {
      await unwrapGeneratedResult(
        await generatedApi.GET('/api/members/check-id', { params: { query: { mberId } } }),
      )
      setIdCheck('available')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setIdCheck('duplicate')
      else {
        setIdCheck('idle')
        setError(err instanceof ApiError ? err.message : 'ID 확인 중 오류가 발생했습니다.')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (idCheck !== 'available') {
      setError('회원ID 중복 확인을 해주세요.')
      return
    }
    if (!pwValid) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }
    if (!pwMatch) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setSubmitting(true)
    try {
      await unwrapGeneratedResult(
        await generatedApi.POST('/api/members/signup', {
          body: {
            mberId,
            password,
            mberNm,
            mberEmailAdres: mberEmailAdres || undefined,
            aflcoNm: aflcoNm || undefined,
            role,
          },
        }),
      )
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '회원가입에 실패했습니다.')
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>가입 신청 후 관리자 승인이 필요합니다</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 회원ID + 중복확인 */}
          <div className="space-y-2">
            <Label htmlFor="mberId">
              회원ID <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="mberId"
                  placeholder="4~50자"
                  value={mberId}
                  maxLength={50}
                  onChange={(e) => {
                    setMberId(e.target.value)
                    setIdCheck('idle')
                  }}
                  className="pl-10"
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleCheckId}
                disabled={!idValid || idCheck === 'checking'}
              >
                {idCheck === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> : '중복확인'}
              </Button>
            </div>
            {idCheck === 'available' && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                사용 가능한 ID입니다
              </p>
            )}
            {idCheck === 'duplicate' && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                이미 사용 중인 ID입니다
              </p>
            )}
            {mberId.length > 0 && !idValid && (
              <p className="text-xs text-muted-foreground">회원ID는 4자 이상이어야 합니다</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="password">
              비밀번호 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="8~100자"
                value={password}
                maxLength={100}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            {password.length > 0 && !pwValid && (
              <p className="text-xs text-muted-foreground">비밀번호는 8자 이상이어야 합니다</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">
              비밀번호 확인 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            {passwordConfirm.length > 0 && !pwMatch && (
              <p className="text-xs text-red-600">비밀번호가 일치하지 않습니다</p>
            )}
          </div>

          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="mberNm">
              이름 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="mberNm"
                placeholder="이름을 입력하세요"
                value={mberNm}
                maxLength={50}
                onChange={(e) => setMberNm(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* 이메일 (선택) */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="user@khis.go.kr"
                value={mberEmailAdres}
                onChange={(e) => setMberEmailAdres(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 소속 (선택) */}
          <div className="space-y-2">
            <Label htmlFor="aflco">소속</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="aflco"
                placeholder="소속 기관명"
                value={aflcoNm}
                onChange={(e) => setAflcoNm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 요청 권한 */}
          <div className="space-y-2">
            <Label htmlFor="role">
              요청 권한 <span className="text-red-500">*</span>
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">뷰어</SelectItem>
                <SelectItem value="MANAGER">매니저</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <Button type="submit" className="w-full" disabled={!canSubmit || submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            가입 신청
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
