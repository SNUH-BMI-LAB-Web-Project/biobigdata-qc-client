'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileBarChart,
  Gauge,
  LayoutDashboard,
  LogOut,
  Table,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import { useApi } from '@/hooks/use-api'
import type { LoginResponse } from '@/lib/api'
import { AccountDialog } from './account-dialog'
import { QualityScorePopover } from './quality-score-popover'

const PRIMARY_NAV_ITEMS = [
  { name: '품질검증 실행', href: '/dashboard', icon: LayoutDashboard },
] as const

const RESULT_NAV_ITEMS = [
  { name: '데이터 품질 결과', href: '/dashboard/quality-results', icon: ClipboardCheck },
  { name: '데이터 통계 결과', href: '/dashboard/data', icon: FileBarChart },
] as const

const SECONDARY_NAV_ITEMS = [
  { name: '지표DB 관리', href: '/dashboard/indicators', icon: Table },
] as const

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter()
  const [accountOpen, setAccountOpen] = useState(false)

  const { data: me, refetch: refetchMe } = useApi(
    async (signal) =>
      unwrapGeneratedResult<LoginResponse>(
        await generatedApi.GET('/api/auth/me', { signal }),
      ),
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
      <AccountDialog
        open={accountOpen}
        onOpenChange={setAccountOpen}
        me={me}
        onChanged={refetchMe}
      />
    </div>
  )
}

function DashboardHeader({
  userName,
  onLogoClick,
  onAccountClick,
  onLogout,
}: {
  userName: string | undefined
  onLogoClick: () => void
  onAccountClick: () => void
  onLogout: () => void
}) {
  return (
    <header className="border-b bg-card flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity text-left"
          onClick={onLogoClick}
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Database className="w-4 h-4 text-primary" />
          </span>
          <span>
            <span className="block text-base font-bold">BIKO-DQM</span>
            <span className="block text-xs text-muted-foreground">품질관리 대시보드</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onAccountClick} className="gap-2 text-sm h-8">
            <User className="w-3.5 h-3.5" />
            {userName ?? '마이페이지'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2 text-sm h-8">
            <LogOut className="w-3.5 h-3.5" />
            {'로그아웃'}
          </Button>
        </div>
      </div>
    </header>
  )
}

function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [resultsOpen, setResultsOpen] = useState(true)

  return (
    <aside className="w-48 border-r bg-card flex flex-col flex-shrink-0">
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={pathname === item.href}
            onClick={() => router.push(item.href)}
          />
        ))}

        <div className="pt-2">
          <Button
            variant="ghost"
            className="w-full justify-between gap-2 text-sm h-9"
            onClick={() => setResultsOpen((open) => !open)}
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>{'품질검증 결과'}</span>
            </span>
            {resultsOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </Button>

          {resultsOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {RESULT_NAV_ITEMS.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  size="sub"
                  onClick={() => router.push(item.href)}
                />
              ))}
            </div>
          )}
        </div>

        {SECONDARY_NAV_ITEMS.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={pathname === item.href}
            onClick={() => router.push(item.href)}
          />
        ))}
      </nav>

      <div className="p-3 border-t flex-shrink-0">
        <QualityScorePopover
          trigger={
            <span className="inline-flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              {'품질 점수 기준'}
            </span>
          }
        />
      </div>
    </aside>
  )
}

function SidebarLink({
  item,
  active,
  size = 'main',
  onClick,
}: {
  item: {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }
  active: boolean
  size?: 'main' | 'sub'
  onClick: () => void
}) {
  const Icon = item.icon

  return (
    <Button
      variant={active ? 'secondary' : 'ghost'}
      className={cn(
        'w-full justify-start gap-2',
        size === 'sub' ? 'text-xs h-8' : 'text-sm h-9',
        active && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
      )}
      onClick={onClick}
    >
      <Icon className={size === 'sub' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {item.name}
    </Button>
  )
}
