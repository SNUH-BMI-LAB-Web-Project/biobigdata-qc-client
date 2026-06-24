'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { Database, Lock, User, Mail, Building2, BadgeCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { ApiError, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type { Role } from '@/lib/api'

type IdCheck = 'idle' | 'checking' | 'available' | 'duplicate'

export default function SignupPage() {
  const router = useRouter()

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
  const [done, setDone] = useState(false)

  // 유효성
  const idValid = mberId.length >= 4
  const pwValid = password.length >= 8
  const pwMatch = password === passwordConfirm && passwordConfirm.length > 0
  const canSubmit =
    idValid && pwValid && pwMatch && mberNm.trim().length > 0 && idCheck === 'available'

  // 회원ID 중복 확인 (사용 가능 200 / 중복 409)
  const handleCheckId = async () => {
    if (!idValid) return
    setIdCheck('checking')
    try {
      await unwrapGeneratedResult(
        await generatedApi.GET('/api/members/check-id', {
          params: { query: { mberId } },
        }),
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
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '회원가입에 실패했습니다.')
      setSubmitting(false)
    }
  }

  // 가입 신청 완료 화면 (관리자 승인 대기)
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center text-center gap-4 py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">가입 신청 완료</h2>
              <p className="text-sm text-muted-foreground mt-2 text-pretty">
                관리자 승인 후 로그인할 수 있습니다.
                <br />
                승인까지 잠시 기다려 주세요.
              </p>
            </div>
            <Button className="w-full" onClick={() => router.push('/')}>
              로그인 화면으로
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-balance">BIKO-DQM</h1>
          <p className="text-muted-foreground mt-2 text-pretty">의학 데이터베이스 품질관리 시스템</p>
        </div>

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

        <p className="text-center text-sm text-muted-foreground mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/" className="text-primary font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
