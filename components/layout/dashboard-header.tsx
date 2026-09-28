'use client'

import { Database, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROLE_LABEL, type LoginResponse } from '@/lib/api'

interface DashboardHeaderProps {
  user: LoginResponse | null | undefined
  onLogoClick: () => void
  onAccountClick: () => void
  onLogout: () => void
}

/** 대시보드 공통 헤더 — 로고 · 계정(사용자명) · 로그아웃 */
export function DashboardHeader({
  user,
  onLogoClick,
  onAccountClick,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="h-16 shrink-0 bg-header text-header-foreground shadow-sm">
      <div className="flex h-full min-w-0 items-center justify-between gap-4 px-6">
        <button
          type="button"
          className="flex min-w-0 cursor-pointer items-center gap-3 rounded-md text-left outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/80"
          onClick={onLogoClick}
          aria-label="BIKO-DQM 대시보드 홈"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10">
            <Database className="h-5 w-5 text-white" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold leading-6">
              BIKO-DQM
            </span>
            <span className="block truncate text-[13px] leading-5 text-white/70">
              품질관리 대시보드
            </span>
          </span>
        </button>

        <div className="flex min-w-0 items-center gap-4">
          <div className='text-center'>
            <div className='flex gap-2'>
              <div className='opacity-80'>{user?.aflcoNm}</div>
              <div>{user?.mberNm}</div>
            </div>
            <div className='opacity-80'>
              {ROLE_LABEL[user?.role ?? 'VIEWER']}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onAccountClick}
            className="min-w-0 gap-2 text-white hover:bg-white/10 hover:text-white active:bg-white/20"
          >
            <User className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onLogout}
            className="gap-2 text-white hover:bg-white/10 hover:text-white active:bg-white/20"
          >
            <LogOut className='size-5' />

          </Button>
        </div>
      </div>
    </header>
  )
}
