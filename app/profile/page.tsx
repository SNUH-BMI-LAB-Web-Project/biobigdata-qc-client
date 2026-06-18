'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Database,
  ArrowLeft,
  User,
  Mail,
  Shield,
  Loader2,
  Trash2,
} from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { authApi, memberApi, ApiError } from '@/lib/api'
import type { Role } from '@/lib/api'

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: '관리자',
  MANAGER: '품질관리자',
  VIEWER: '조회자',
}

export default function ProfilePage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/dashboard')
  }

  // 현재 로그인 사용자 조회
  const { data: user, loading, error, refetch } = useApi((signal) => authApi.me(signal), [])

  // 프로필 수정 폼 상태
  const [mberNm, setMberNm] = useState('')
  const [mberEmailAdres, setMberEmailAdres] = useState('')
  const [aflcoNm, setAflcoNm] = useState('')
  // 전화번호는 authApi.me() 응답에 없어 빈 값으로 초기화 (조회 시 소스 없음)
  const [mbtlnum, setMbtlnum] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // 비밀번호 변경 폼 상태
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // 탈퇴 상태
  const [withdrawing, setWithdrawing] = useState(false)

  // 사용자 정보 로드 시 폼 초기화
  useEffect(() => {
    if (!user) return
    setMberNm(user.mberNm ?? '')
    setMberEmailAdres(user.mberEmailAdres ?? '')
    setAflcoNm(user.aflcoNm ?? '')
  }, [user])

  const handleSaveProfile = async () => {
    if (!mberNm.trim()) {
      alert('이름을 입력해 주세요.')
      return
    }
    setSavingProfile(true)
    try {
      await memberApi.updateMe({
        mberNm: mberNm.trim(),
        mbtlnum: mbtlnum.trim() || undefined,
        mberEmailAdres: mberEmailAdres.trim() || undefined,
        aflcoNm: aflcoNm.trim() || undefined,
      })
      alert('프로필 정보가 수정되었습니다.')
      refetch()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '프로필 수정에 실패했습니다.'
      alert(message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      alert('현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.')
      return
    }
    if (newPassword.length < 8 || newPassword.length > 50) {
      alert('새 비밀번호는 8~50자여야 합니다.')
      return
    }
    setChangingPassword(true)
    try {
      await memberApi.changePassword({ oldPassword, newPassword })
      alert('비밀번호가 변경되었습니다.')
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '비밀번호 변경에 실패했습니다.'
      alert(message)
    } finally {
      setChangingPassword(false)
    }
  }

  const handleWithdraw = async () => {
    if (!confirm('정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }
    setWithdrawing(true)
    try {
      await memberApi.withdraw()
      alert('회원 탈퇴가 완료되었습니다.')
      router.push('/')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '회원 탈퇴에 실패했습니다.'
      alert(message)
      setWithdrawing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">BIKO-DQM</h1>
              <p className="text-xs text-muted-foreground">마이페이지</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>프로필 정보를 불러오는 중...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={refetch}>
              다시 시도
            </Button>
          </div>
        ) : !user ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            사용자 정보를 찾을 수 없습니다.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>프로필 정보</CardTitle>
                <CardDescription>사용자 기본 정보</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {(user.mberNm || user.mberId).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">{user.mberNm}</h2>
                        <p className="text-muted-foreground">{user.aflcoNm}</p>
                      </div>
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        <Shield className="w-3 h-3 mr-1" />
                        {ROLE_LABEL[user.role] ?? user.role}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">아이디</p>
                          <p className="text-sm font-medium">{user.mberId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">이메일</p>
                          <p className="text-sm font-medium">{user.mberEmailAdres}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 프로필 정보 수정 */}
            <Card>
              <CardHeader>
                <CardTitle>프로필 정보 수정</CardTitle>
                <CardDescription>이름·연락처·이메일·소속을 변경합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mberNm">이름</Label>
                    <Input
                      id="mberNm"
                      value={mberNm}
                      onChange={(e) => setMberNm(e.target.value)}
                      placeholder="이름"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mbtlnum">연락처</Label>
                    <Input
                      id="mbtlnum"
                      value={mbtlnum}
                      onChange={(e) => setMbtlnum(e.target.value)}
                      placeholder="연락처"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mberEmailAdres">이메일</Label>
                    <Input
                      id="mberEmailAdres"
                      type="email"
                      value={mberEmailAdres}
                      onChange={(e) => setMberEmailAdres(e.target.value)}
                      placeholder="이메일"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aflcoNm">소속</Label>
                    <Input
                      id="aflcoNm"
                      value={aflcoNm}
                      onChange={(e) => setAflcoNm(e.target.value)}
                      placeholder="소속"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveProfile} disabled={savingProfile} className="gap-2">
                    {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 비밀번호 변경 */}
            <Card>
              <CardHeader>
                <CardTitle>비밀번호 변경</CardTitle>
                <CardDescription>새 비밀번호는 8~50자여야 합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">현재 비밀번호</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="현재 비밀번호"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">새 비밀번호</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="새 비밀번호 (8~50자)"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="gap-2"
                  >
                    {changingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    비밀번호 변경
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 회원 탈퇴 */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">회원 탈퇴</CardTitle>
                <CardDescription>탈퇴 시 계정이 비활성화되며 되돌릴 수 없습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="gap-2"
                >
                  {withdrawing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  회원 탈퇴
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
