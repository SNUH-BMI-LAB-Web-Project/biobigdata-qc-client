'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  User,
  Mail,
  Shield,
  Calendar,
  Activity,
  FileCheck,
  Clock,
  LogOut,
} from 'lucide-react'

const userData = {
  name: '김철수',
  email: 'kim.chulsoo@medical.org',
  role: '품질관리자',
  department: '의료정보팀',
  joinDate: '2023-03-15',
  lastLogin: '2024-01-15 14:25',
}

const activityData = {
  totalValidations: 1247,
  thisMonth: 89,
  resolvedIssues: 523,
  reportsGenerated: 156,
}

export function ProfilePanel({ onLogout }: { onLogout?: () => void }) {
  return (
    <div className="overflow-y-auto h-full p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>프로필 정보</CardTitle>
            <CardDescription>사용자 기본 정보</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {userData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4 w-full min-w-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold">{userData.name}</h2>
                    <p className="text-muted-foreground">{userData.department}</p>
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1 flex-shrink-0">
                    <Shield className="w-3 h-3 mr-1" />
                    {userData.role}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">이메일</p>
                      <p className="text-sm font-medium">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">가입일</p>
                      <p className="text-sm font-medium">{userData.joinDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 sm:col-span-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">마지막 로그인</p>
                      <p className="text-sm font-medium">{userData.lastLogin}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>활동 통계</CardTitle>
            <CardDescription>품질관리 활동 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileCheck className="w-4 h-4" />
                  <span className="text-sm">총 검증 횟수</span>
                </div>
                <p className="text-3xl font-bold text-primary">{activityData.totalValidations}</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm">이번 달 검증</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">{activityData.thisMonth}</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">해결한 이슈</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{activityData.resolvedIssues}</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileCheck className="w-4 h-4" />
                  <span className="text-sm">생성한 보고서</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">{activityData.reportsGenerated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>계정 설정</CardTitle>
            <CardDescription>계정 및 보안 관리</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <User className="w-4 h-4" />
                프로필 정보 수정
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Shield className="w-4 h-4" />
                비밀번호 변경
              </Button>
              <div>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
