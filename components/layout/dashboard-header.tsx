'use client'

import { Database, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  userName: string | undefined
  onLogoClick: () => void
  onAccountClick: () => void
  onLogout: () => void
}

/** 대시보드 공통 헤더 — 로고 · 계정(사용자명) · 로그아웃 */
export function DashboardHeader({
  userName,
  onLogoClick,
  onAccountClick,
  onLogout,
}: DashboardHeaderProps) {
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
