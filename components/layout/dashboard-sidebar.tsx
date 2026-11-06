'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gauge,
  LayoutDashboard,
  NotebookPen,
  Sparkles,
  Table,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useAgentEnabled } from '@/hooks/use-agent-enabled'
import { QualityScorePopover } from './quality-score-popover'
import { PopoverArrow } from '@radix-ui/react-popover'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}
interface DashboardSidebarProps {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  /** VIEWER 는 품질검증 결과 메뉴만 노출 */
  viewer?: boolean
}
const EXECUTION_ITEM: NavItem = {
  name: '품질검증 실행',
  href: '/dashboard',
  icon: LayoutDashboard,
}
const RESULT_NAV_ITEMS = [
  { name: '데이터 품질 결과', href: '/dashboard/quality-results' },
  { name: '데이터 통계 결과', href: '/dashboard/data' },
] as const
const OTHER_NAV_ITEMS: readonly NavItem[] = [
  { name: '지표DB 관리', href: '/dashboard/indicators', icon: Table },
  { name: '품질검증 일지', href: '/dashboard/journal', icon: NotebookPen },
  { name: 'Agent', href: '/dashboard/agent', icon: Sparkles },
]

/** PDF p.32 LNB: 접힘 상태에서도 하위 메뉴와 품질 기준에 접근할 수 있다. */
export function DashboardSidebar({
  collapsed,
  onCollapsedChange,
  viewer = false,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const { anyEnabled: agentEnabled } = useAgentEnabled()
  const [resultsOpen, setResultsOpen] = useState(true)
  const resultsActive = RESULT_NAV_ITEMS.some((item) =>
    isPathActive(pathname, item.href),
  )
  return (
    <aside
      aria-label="사이드바"
      className='flex relative'
    >
      <div>
        <button
          type="button"
          className="absolute -right-3 top-8 z-30 flex size-6 items-center justify-center rounded-full border border-primary bg-white text-primary shadow-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          aria-expanded={!collapsed}
          aria-controls="dashboard-navigation"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>
      <div className={cn(
        'flex relative z-20 transition-[width] duration-200 motion-reduce:transition-none bg-sidebar overflow-hidden',
        collapsed ? 'w-16' : 'w-65',
      )}>
        <div className={cn(
          'flex min-h-0 shrink-0 flex-col text-sidebar-foreground',
          collapsed ? 'w-16' : 'w-65',
        )}>
          <nav
            id="dashboard-navigation"
            aria-label="품질관리 메뉴"
            className="min-h-0 flex-1 overflow-y-auto px-3 pb-8 pt-8"
          >
            <p
              className={
                collapsed
                  ? 'sr-only'
                  : 'mb-5 px-3 text-lg font-bold leading-6.5'
              }
            >
              대시보드
            </p>
            <div className={collapsed ? 'h-6.5 mb-5' : ''}></div>
            <div className="space-y-1">
              {!viewer && (
                <SidebarLink
                  item={EXECUTION_ITEM}
                  active={isPathActive(pathname, EXECUTION_ITEM.href)}
                  collapsed={collapsed}
                />
              )}
              {collapsed ? (
                <CollapsedResults
                  key={pathname}
                  pathname={pathname}
                  active={resultsActive}
                />
              ) : (
                <div>
                  <button
                    type="button"
                    className={cn(
                      sidebarItemClass(resultsOpen || resultsActive),
                      resultsOpen && 'rounded-b-none',
                    )}
                    onClick={() => setResultsOpen((open) => !open)}
                    aria-expanded={resultsOpen}
                    aria-controls="quality-results-submenu"
                  >
                    <BarChart3 className="size-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-left">
                      품질검증 결과
                    </span>
                    {resultsOpen ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </button>
                  <div
                    id="quality-results-submenu"
                    hidden={!resultsOpen}
                    className="rounded-b-md bg-sidebar-submenu py-1"
                  >
                    <ResultLinks pathname={pathname} />
                  </div>
                </div>
              )}
              {!viewer && OTHER_NAV_ITEMS.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={isPathActive(pathname, item.href)}
                  collapsed={collapsed}
                  disabled={item.href === '/dashboard/agent' && !agentEnabled}
                />
              ))}
            </div>
          </nav>
          <div className="shrink-0 border-t border-sidebar-border px-3 py-3">
            <QualityScorePopover
              collapsed={collapsed}
              trigger={
                <>
                  <Gauge className="size-5 shrink-0" aria-hidden="true" />
                  <span className={collapsed ? 'sr-only' : undefined}>
                    품질 점수 기준
                  </span>
                </>
              }
            />
          </div>
        </div>
      </div>
    </aside>
  )
}

function CollapsedResults({
  pathname,
  active,
}: {
  pathname: string
  active: boolean
}) {
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={sidebarItemClass(active || open, true)}
            aria-label="품질검증 결과"
          >
            <BarChart3 className="size-4" aria-hidden="true" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent
        ref={contentRef}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          contentRef.current?.querySelector<HTMLAnchorElement>('a')?.focus()
        }}
        side="right"
        align="center"
        sideOffset={16}
        aria-label="품질검증 결과"
        className="min-w-40 bg-[#264f7e] border-none px-3 py-2"
      >
        <PopoverArrow className='visible fill-[#264f7e]' />
        <div className='flex flex-col gap-1.5'>
          {RESULT_NAV_ITEMS.map((item) => {
            const active = isPathActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className='text-white'
              >
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ResultLinks({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return RESULT_NAV_ITEMS.map((item) => {
    const active = isPathActive(pathname, item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        onClick={onNavigate}
        className={cn(
          'mx-1 flex min-h-8 items-center gap-2 rounded px-3 py-1.5 text-[13px] font-medium leading-5 text-sidebar-submenu-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
          active && 'bg-accent',
        )}
      >
        <span className="truncate pl-6">{item.name}</span>
      </Link>
    )
  })
}

function SidebarLink({
  item,
  active,
  collapsed,
  disabled = false,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  disabled?: boolean
}) {
  const Icon = item.icon
  if (disabled) {
    return <div></div>
  }
  return (
    <div>
      <Link
        href={item.href}
        className={sidebarItemClass(active, collapsed)}
        aria-current={active ? 'page' : undefined}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className={collapsed ? 'sr-only' : 'truncate'}>{item.name}</span>
      </Link>
    </div>
  )
}

function sidebarItemClass(active: boolean, collapsed = false) {
  return cn(
    'flex h-10 w-full items-center rounded-md text-sm font-medium leading-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sidebar-ring',
    collapsed ? 'justify-center' : 'justify-start gap-3 px-3',
    active
      ? 'bg-[image:var(--sidebar-selected-background)] font-bold text-sidebar-primary-foreground'
      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
  )
}

function isPathActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}
