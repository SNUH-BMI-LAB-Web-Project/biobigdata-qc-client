'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileBarChart,
  Gauge,
  LayoutDashboard,
  Table,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { QualityScorePopover } from './quality-score-popover'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { name: '품질검증 실행', href: '/dashboard', icon: LayoutDashboard },
]

const RESULT_NAV_ITEMS: readonly NavItem[] = [
  { name: '데이터 품질 결과', href: '/dashboard/quality-results', icon: ClipboardCheck },
  { name: '데이터 통계 결과', href: '/dashboard/data', icon: FileBarChart },
]

const SECONDARY_NAV_ITEMS: readonly NavItem[] = [
  { name: '지표DB 관리', href: '/dashboard/indicators', icon: Table },
]

/** 대시보드 공통 사이드바 — 1차/결과(접힘)/지표DB 내비 + 품질 점수 팝오버 */
export function DashboardSidebar() {
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
  item: NavItem
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
