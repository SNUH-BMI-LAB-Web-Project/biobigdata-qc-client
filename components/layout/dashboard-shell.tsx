'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import { isViewerPathAllowed, VIEWER_HOME } from '@/lib/viewer-access'
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
  const pathname = usePathname()
  const [accountOpen, setAccountOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { data: me, refetch: refetchMe } = useApi(
    async (signal) =>
      unwrapGeneratedResult<LoginResponse>(
        await generatedApi.GET('/api/auth/me', { signal }),
      ),
    [],
  )

  const isViewer = me?.role === 'VIEWER'
  const unauthorized = isViewer && !isViewerPathAllowed(pathname)

  const handleLogout = async () => {
    try {
      await unwrapGeneratedResult(await generatedApi.POST('/api/auth/logout'))
    } catch {
      // 로그아웃 API 실패와 무관하게 클라이언트는 로그인 화면으로 보낸다.
    }
    router.push('/')
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <DashboardHeader
        user={me}
        onLogoClick={() => router.push(isViewer ? VIEWER_HOME : '/dashboard')}
        onAccountClick={() => setAccountOpen(true)}
        onLogout={handleLogout}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          viewer={isViewer}
        />
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          {unauthorized ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <p className="text-5xl font-bold text-primary">401</p>
              <p className="text-lg font-semibold">접근 권한이 없습니다</p>
              <p className="text-sm text-muted-foreground">
                이 페이지에 접근할 수 있는 권한이 없습니다.
              </p>
            </div>
          ) : me ? (
            children
          ) : null}
        </div>
      </div>
      <AccountDialog
        open={accountOpen}
        onOpenChange={setAccountOpen}
        me={me}
        onChanged={refetchMe}
      />
    </div>
  )
}
