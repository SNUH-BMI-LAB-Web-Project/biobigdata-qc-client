'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, BarChart3, Bell, Users, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

type SettingSection = 'quality-score' | 'notifications' | 'users' | 'permissions' | 'security'

const settingSections = [
  { id: 'quality-score' as SettingSection, name: '대시보드 품질 점수 기준', icon: BarChart3 },
  { id: 'notifications' as SettingSection, name: '알림 설정', icon: Bell },
  { id: 'users' as SettingSection, name: '사용자 관리', icon: Users },
  { id: 'permissions' as SettingSection, name: '지표DB 권한 관리', icon: Shield },
  { id: 'security' as SettingSection, name: '보안 설정', icon: Shield },
]

export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState<SettingSection>('quality-score')
  const [excellent, setExcellent] = useState(95)
  const [good, setGood] = useState(85)
  const [fair, setFair] = useState(75)

  const handleSave = () => {
    alert('설정이 저장되었습니다.')
  }

  return (
    <div className="flex flex-col sm:flex-row h-full overflow-hidden">
      <aside className="sm:w-56 border-b sm:border-b-0 sm:border-r bg-card flex-shrink-0 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto">
        <h2 className="px-3 pt-4 pb-2 text-sm font-bold hidden sm:block">설정</h2>
        <nav className="p-2 flex sm:flex-col gap-1 sm:space-y-0">
          {settingSections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap flex-shrink-0 sm:w-full',
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

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl">
          {activeSection === 'quality-score' && (
            <QualityScoreSection
              excellent={excellent}
              good={good}
              fair={fair}
              onExcellentChange={setExcellent}
              onGoodChange={setGood}
              onFairChange={setFair}
              onSave={handleSave}
            />
          )}

          {activeSection === 'notifications' && (
            <PlaceholderSection
              title="알림 설정"
              description="시스템 알림 및 이메일 설정"
              icon={Bell}
              message="알림 설정 기능이 곧 추가됩니다"
            />
          )}

          {activeSection === 'users' && (
            <PlaceholderSection
              title="사용자 관리"
              description="시스템 사용자 및 권한 관리"
              icon={Users}
              message="사용자 관리 기능이 곧 추가됩니다"
            />
          )}

          {activeSection === 'permissions' && (
            <PermissionsSection onSave={handleSave} />
          )}

          {activeSection === 'security' && (
            <PlaceholderSection
              title="보안 설정"
              description="시스템 보안 및 접근 제어 설정"
              icon={Shield}
              message="보안 설정 기능이 곧 추가됩니다"
            />
          )}
        </div>
      </main>
    </div>
  )
}

function QualityScoreSection({
  excellent, good, fair,
  onExcellentChange, onGoodChange, onFairChange,
  onSave,
}: {
  excellent: number; good: number; fair: number
  onExcellentChange: (v: number) => void
  onGoodChange: (v: number) => void
  onFairChange: (v: number) => void
  onSave: () => void
}) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold">대시보드 품질 점수 기준</h1>
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
          <ScoreField
            id="excellent"
            label="우수 (Excellent)"
            value={excellent}
            onChange={onExcellentChange}
            suffix="점 이상"
            colorClass="bg-green-500"
            colorLabel="녹색으로 표시"
            description={`${excellent}점 이상은 우수한 품질로 평가됩니다`}
          />
          <ScoreField
            id="good"
            label="양호 (Good)"
            value={good}
            onChange={onGoodChange}
            suffix={`점 이상 ${excellent}점 미만`}
            colorClass="bg-yellow-500"
            colorLabel="노란색으로 표시"
            description={`${good}점 이상 ${excellent}점 미만은 양호한 품질로 평가됩니다`}
          />
          <ScoreField
            id="fair"
            label="보통 (Fair)"
            value={fair}
            onChange={onFairChange}
            suffix={`점 이상 ${good}점 미만`}
            colorClass="bg-red-500"
            colorLabel="빨간색으로 표시"
            description={`${fair}점 미만은 개선이 필요한 품질로 평가됩니다`}
          />
          <div className="pt-4 border-t">
            <Button onClick={onSave} className="gap-2">
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
              <span className="font-medium text-yellow-600">{good}점 ~ {excellent - 1}점</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-muted/30">
              <span>보통</span>
              <span className="font-medium text-red-600">{fair}점 미만</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function ScoreField({
  id, label, value, onChange, suffix, colorClass, colorLabel, description,
}: {
  id: string; label: string; value: number
  onChange: (v: number) => void
  suffix: string; colorClass: string; colorLabel: string; description: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-3">
        <Input
          id={id}
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">{suffix}</span>
        <div className="flex-1 flex items-center gap-2">
          <div className={cn('h-2 w-16 rounded', colorClass)} />
          <span className="text-xs text-muted-foreground">{colorLabel}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

function PlaceholderSection({
  title, description, icon: Icon, message,
}: {
  title: string; description: string
  icon: React.ComponentType<{ className?: string }>
  message: string
}) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{message}</p>
        </CardContent>
      </Card>
    </>
  )
}

function PermissionsSection({ onSave }: { onSave: () => void }) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold">지표DB 권한 관리</h1>
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
            <div className="hidden sm:grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-md font-medium text-sm">
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
              <div key={index} className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-3 p-3 border rounded-md sm:items-center">
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-sm text-muted-foreground truncate">{user.email}</div>
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

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                관리 권한: 지표 적용/해제 가능 | 조회 권한: 지표 정보 조회만 가능
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
