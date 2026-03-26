'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Database,
  ArrowLeft,
  User,
  Mail,
  Shield,
  Calendar,
  Activity,
  FileCheck,
  Clock,
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/dashboard')
  }

  // 샘플 사용자 데이터
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
                    {userData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{userData.name}</h2>
                      <p className="text-muted-foreground">{userData.department}</p>
                    </div>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      <Shield className="w-3 h-3 mr-1" />
                      {userData.role}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 md:col-span-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  알림 설정
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
