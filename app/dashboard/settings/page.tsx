'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, BarChart3, Bell, Users, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

type SettingSection = 'quality-score' | 'notifications' | 'users' | 'permissions' | 'security'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingSection>('quality-score')
  const [excellent, setExcellent] = useState(95)
  const [good, setGood] = useState(85)
  const [fair, setFair] = useState(75)

  const settingSections = [
    { id: 'quality-score' as SettingSection, name: '대시보드 품질 점수 기준', icon: BarChart3 },
    { id: 'notifications' as SettingSection, name: '알림 설정', icon: Bell },
    { id: 'users' as SettingSection, name: '사용자 관리', icon: Users },
    { id: 'permissions' as SettingSection, name: '지표DB 권한 관리', icon: Shield },
    { id: 'security' as SettingSection, name: '보안 설정', icon: Shield },
  ]

  const handleSave = () => {
    alert('설정이 저장되었습니다.')
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
                  사용자별 지표DB 접근 권한 설정
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">사용자 권한 설정</CardTitle>
                  <CardDescription className="text-sm">
                    각 사용자의 지표DB 관리 권한을 설정합니다
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
                  시스템 보안 및 접근 제어 설정
                </p>
              </div>
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>보안 설정 기능이 곧 추가됩니다</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
