'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, BarChart3, Bell, Users, Shield, Loader2, KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApi } from '@/hooks/use-api'
import { authApi, memberApi, ApiError, ROLE_LABEL } from '@/lib/api'

type SettingSection = 'quality-score' | 'notifications' | 'users' | 'permissions' | 'security'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingSection>('quality-score')
  const [excellent, setExcellent] = useState(95)
  const [good, setGood] = useState(85)
  const [fair, setFair] = useState(75)

  // 현재 로그인 사용자
  const { data: me, loading: meLoading, error: meError } = useApi(
    (signal) => authApi.me(signal),
    [],
  )

  // 비밀번호 변경 폼 상태
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSubmitting, setPwSubmitting] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  const settingSections = [
    { id: 'quality-score' as SettingSection, name: '대시보드 품질 점수 기준', icon: BarChart3 },
    { id: 'notifications' as SettingSection, name: '알림 설정', icon: Bell },
    { id: 'users' as SettingSection, name: '사용자 관리', icon: Users },
    { id: 'permissions' as SettingSection, name: '지표DB 권한 관리', icon: Shield },
    { id: 'security' as SettingSection, name: '보안 설정', icon: Shield },
  ]

  // 품질 점수 기준은 백엔드 엔드포인트가 없어 로컬 상태로만 유지된다.
  const handleSave = () => {
    alert('설정이 저장되었습니다. (현재 로컬에만 적용됩니다)')
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    setPwSuccess(false)

    if (newPassword.length < 8 || newPassword.length > 50) {
      setPwError('새 비밀번호는 8자 이상 50자 이하여야 합니다.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.')
      return
    }

    setPwSubmitting(true)
    try {
      await memberApi.changePassword({ oldPassword, newPassword })
      setPwSuccess(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      alert('비밀번호가 변경되었습니다.')
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : '비밀번호 변경에 실패했습니다.'
      setPwError(message)
    } finally {
      setPwSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex overflow-auto">
      {/* Left Sidebar - Settings Menu */}
      <aside className="w-64 border-r bg-card flex-shrink-0">
        <div className="p-4">
          <h2 className="text-lg font-bold mb-1">설정</h2>
          <p className="text-xs text-muted-foreground">시스템 설정 및 관리</p>
        </div>
        <nav className="px-2 pb-4 space-y-1">
          {settingSections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted text-muted-foreground'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">{section.name}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Right Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-6 max-w-4xl">
          {activeSection === 'quality-score' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold">대시보드 품질 점수 기준</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  대시보드에서 사용할 품질 등급별 최소 점수를 설정합니다
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">점수 기준 설정</CardTitle>
                  <CardDescription className="text-sm">
                    각 품질 등급의 최소 점수를 지정하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="excellent" className="text-sm font-medium">
                      우수 (Excellent)
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="excellent"
                        type="number"
                        min={0}
                        max={100}
                        value={excellent}
                        onChange={(e) => setExcellent(Number(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        점 이상
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="h-2 w-16 bg-green-500 rounded" />
                        <span className="text-xs text-muted-foreground">녹색으로 표시</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {excellent}점 이상은 우수한 품질로 평가됩니다
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="good" className="text-sm font-medium">
                      양호 (Good)
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="good"
                        type="number"
                        min={0}
                        max={100}
                        value={good}
                        onChange={(e) => setGood(Number(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        점 이상 {excellent}점 미만
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="h-2 w-16 bg-yellow-500 rounded" />
                        <span className="text-xs text-muted-foreground">노란색으로 표시</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {good}점 이상 {excellent}점 미만은 양호한 품질로 평가됩니다
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fair" className="text-sm font-medium">
                      보통 (Fair)
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="fair"
                        type="number"
                        min={0}
                        max={100}
                        value={fair}
                        onChange={(e) => setFair(Number(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        점 이상 {good}점 미만
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="h-2 w-16 bg-red-500 rounded" />
                        <span className="text-xs text-muted-foreground">빨간색으로 표시</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {fair}점 미만은 개선이 필요한 품질로 평가됩니다
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="w-4 h-4" />
                      설정 저장
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">현재 적용 기준</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <span>우수</span>
                      <span className="font-medium text-green-600">{excellent}점 이상</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <span>양호</span>
                      <span className="font-medium text-yellow-600">{good}점 ~ {excellent-1}점</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <span>보통</span>
                      <span className="font-medium text-red-600">{fair}점 미만</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'notifications' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold">알림 설정</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  시스템 알림 및 이메일 설정
                </p>
              </div>
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>알림 설정 기능이 곧 추가됩니다</p>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'users' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold">사용자 관리</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  시스템 사용자 및 권한 관리
                </p>
              </div>
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>사용자 관리 기능이 곧 추가됩니다</p>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'permissions' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold">지표DB 권한 관리</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  사용자별 지표DB 접근 권한 설정 (관리자 페이지 연동 예정)
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">사용자 권한 설정</CardTitle>
                  <CardDescription className="text-sm">
                    각 사용자의 지표DB 관리 권한을 설정합니다 — 현재는 예시 데이터이며,
                    실제 사용자/권한 관리는 별도 관리자 페이지에서 처리됩니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-md font-medium text-sm">
                      <div>사용자</div>
                      <div>이메일</div>
                      <div>권한</div>
                    </div>

                    {[
                      { name: '홍길동', email: 'hong@example.com', role: 'admin' },
                      { name: '김철수', email: 'kim@example.com', role: 'manager' },
                      { name: '이영희', email: 'lee@example.com', role: 'viewer' },
                      { name: '박민수', email: 'park@example.com', role: 'viewer' },
                    ].map((user, index) => (
                      <div key={index} className="grid grid-cols-3 gap-3 p-3 border rounded-md items-center">
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div>
                          <select
                            defaultValue={user.role}
                            className="h-8 px-2 text-xs border rounded-md bg-background w-full"
                          >
                            <option value="admin">관리자 (전체 권한)</option>
                            <option value="manager">관리 권한</option>
                            <option value="viewer">조회 권한</option>
                          </select>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        관리 권한: 지표 적용/해제 가능 | 조회 권한: 지표 정보 조회만 가능
                      </p>
                      <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" />
                        권한 저장
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'security' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold">보안 설정</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  계정 정보 확인 및 비밀번호 변경
                </p>
              </div>

              {/* 계정 정보 */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">계정 정보</CardTitle>
                  <CardDescription className="text-sm">
                    현재 로그인한 사용자 정보입니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {meLoading ? (
                    <div className="flex items-center justify-center py-6 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-sm">불러오는 중...</span>
                    </div>
                  ) : meError ? (
                    <p className="text-sm text-red-600 py-4">{meError}</p>
                  ) : me ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <span className="text-muted-foreground">아이디</span>
                        <span className="font-medium">{me.mberId}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <span className="text-muted-foreground">이름</span>
                        <span className="font-medium">{me.mberNm}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <span className="text-muted-foreground">이메일</span>
                        <span className="font-medium">{me.mberEmailAdres}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <span className="text-muted-foreground">소속</span>
                        <span className="font-medium">{me.aflcoNm}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <span className="text-muted-foreground">권한</span>
                        <span className="font-medium">{ROLE_LABEL[me.role] ?? me.role}</span>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* 비밀번호 변경 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">비밀번호 변경</CardTitle>
                  <CardDescription className="text-sm">
                    안전한 계정 관리를 위해 주기적으로 비밀번호를 변경하세요 (8~50자)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword" className="text-sm font-medium">
                        현재 비밀번호
                      </Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        autoComplete="current-password"
                        className="max-w-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium">
                        새 비밀번호
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        className="max-w-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        새 비밀번호 확인
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        className="max-w-sm"
                      />
                    </div>

                    {pwError && (
                      <p className="text-sm text-red-600">{pwError}</p>
                    )}
                    {pwSuccess && (
                      <p className="text-sm text-green-600">비밀번호가 변경되었습니다.</p>
                    )}

                    <div className="pt-2">
                      <Button type="submit" disabled={pwSubmitting} className="gap-2">
                        {pwSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <KeyRound className="w-4 h-4" />
                        )}
                        비밀번호 변경
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
