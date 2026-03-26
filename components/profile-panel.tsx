'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  User,
  Shield,
  Activity,
  FileCheck,
  LogOut,
} from 'lucide-react'

const userData = {
  name: '김철수',
  email: 'kim.chulsoo@medical.org',
  role: '품질관리자',
  department: '의료정보팀',
}

const activityData = {
  totalValidations: 1247,
  thisMonth: 89,
  resolvedIssues: 523,
  reportsGenerated: 156,
}

export function ProfilePanel({ onLogout }: { onLogout?: () => void }) {
  return (
    <div className="overflow-y-auto px-4 pb-0 pt-4 sm:px-6 sm:pb-0 sm:pt-6">
      <div className="w-full space-y-6">
        {/* Profile Card */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold">계정 설정</h2>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
            <Avatar className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
              <AvatarFallback className="text-base bg-primary text-primary-foreground">
                {userData.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4 w-full min-w-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{userData.name}</h2>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 flex-shrink-0">
                    {userData.department}
                  </Badge>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 flex-shrink-0">
                    <Shield className="w-3 h-3 mr-1" />
                    {userData.role}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Statistics */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-md border border-border bg-card">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <FileCheck className="w-3 h-3" />
                  <span className="text-xs">총 검증 횟수</span>
                </div>
                <p className="text-lg font-bold text-primary">{activityData.totalValidations}</p>
              </div>
            </div>
            <div className="p-2 rounded-md border border-border bg-card">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  <span className="text-xs">이번 달 검증</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{activityData.thisMonth}</p>
              </div>
            </div>
            <div className="p-2 rounded-md border border-border bg-card">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span className="text-xs">해결한 이슈</span>
                </div>
                <p className="text-lg font-bold text-green-600">{activityData.resolvedIssues}</p>
              </div>
            </div>
            <div className="p-2 rounded-md border border-border bg-card">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <FileCheck className="w-3 h-3" />
                  <span className="text-xs">생성한 보고서</span>
                </div>
                <p className="text-lg font-bold text-purple-600">{activityData.reportsGenerated}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="space-y-4">
          <div className="space-y-0">
            <Button variant="outline" className="w-full justify-start gap-2 border-0 shadow-none">
              <User className="w-4 h-4" />
              프로필 정보 수정
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 border-0 shadow-none">
              <Shield className="w-4 h-4" />
              비밀번호 변경
            </Button>
            <div>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-0 shadow-none text-destructive hover:text-destructive"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
