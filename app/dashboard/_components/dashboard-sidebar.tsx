'use client'

import { Button } from '@/components/ui/button'
import { LayoutDashboard, Table, BarChart3, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavLink } from '@/components/nav-link'

const navItems = [
  { name: '품질검증 대시보드', href: '/dashboard', icon: LayoutDashboard },
  { name: '데이터 통계', href: '/dashboard/data', icon: BarChart3 },
  { name: '지표DB 관리', href: '/dashboard/indicators', icon: Table },
] as const

interface DashboardSidebarProps {
  settingsOpen: boolean
  profileOpen: boolean
  onSettingsOpen: () => void
  onProfileOpen: () => void
  onNavClick?: () => void
}

export function DashboardSidebar({
  settingsOpen,
  profileOpen,
  onSettingsOpen,
  onProfileOpen,
  onNavClick,
}: DashboardSidebarProps) {
  return (
    <>
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.name}
            onClick={onNavClick}
          />
        ))}
        <Button
          variant={settingsOpen ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start gap-2 text-sm h-9',
            settingsOpen && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
          )}
          onClick={onSettingsOpen}
        >
          <Settings className="w-4 h-4" />
          설정
        </Button>
      </nav>
      <nav className="p-3 border-t space-y-1 flex-shrink-0">
        <Button
          variant={profileOpen ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start gap-2 text-sm h-9',
            profileOpen && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
          )}
          onClick={onProfileOpen}
        >
          <User className="w-4 h-4" />
          김철수
        </Button>
      </nav>
    </>
  )
}
