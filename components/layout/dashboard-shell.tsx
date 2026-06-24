'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import { useApi } from '@/hooks/use-api'
import type { LoginResponse } from '@/lib/api'
import { AccountDialog } from './account-dialog'
import { DashboardHeader } from './dashboard-header'
import { DashboardSidebar } from './dashboard-sidebar'

interface DashboardShellProps {
  children: React.ReactNode
}

/** 대시보드 공통 레이아웃 셸 — 헤더 + 사이드바 + 계정 모달을 조합하고 로그인 사용자/로그아웃을 관리한다. */
export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter()
  const [accountOpen, setAccountOpen] = useState(false)

  const { data: me, refetch: refetchMe } = useApi(
    async (signal) =>
      unwrapGeneratedResult<LoginResponse>(await generatedApi.GET('/api/auth/me', { signal })),
    [],
  )

  const handleLogout = async () => {
    try {
      await unwrapGeneratedResult(await generatedApi.POST('/api/auth/logout'))
    } catch {
      // 로그아웃 API 실패와 무관하게 클라이언트는 로그인 화면으로 보낸다.
    }
    router.push('/')
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <DashboardHeader
        userName={me?.mberNm}
        onLogoClick={() => router.push('/dashboard')}
        onAccountClick={() => setAccountOpen(true)}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
      <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} me={me} onChanged={refetchMe} />
    </div>
  )
}
