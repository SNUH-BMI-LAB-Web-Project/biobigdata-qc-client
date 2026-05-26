'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Database, LogOut, User, LayoutDashboard, Table, Settings, BarChart3, ChevronDown, ChevronRight, ClipboardCheck, FileBarChart } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isResultsOpen, setIsResultsOpen] = useState(true)

  const handleLogout = () => {
    router.push('/')
  }

  const handleProfile = () => {
    router.push('/profile')
  }

  const navItems = [
    { name: '품질검증 실행', href: '/dashboard', icon: LayoutDashboard },
  ]

  const resultSubItems = [
    { name: '데이터 품질 결과', href: '/dashboard/quality-results', icon: ClipboardCheck },
    { name: '데이터 통계 결과', href: '/dashboard/data', icon: FileBarChart },
  ]

  const navItemsAfterResults = [
    { name: '지표DB 관리', href: '/dashboard/indicators', icon: Table },
  ]

  const bottomNavItems = [
    { name: '설정', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="border-b bg-card flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/dashboard')}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold">BIKO-DQM</h1>
              <p className="text-xs text-muted-foreground">품질관리 대시보드</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfile}
              className="gap-2 text-sm h-8"
            >
              <User className="w-3.5 h-3.5" />
              마이페이지
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-sm h-8"
            >
              <LogOut className="w-3.5 h-3.5" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation - Fixed */}
        <aside className="w-48 border-r bg-card flex flex-col flex-shrink-0">
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2 text-sm h-9',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                  )}
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Button>
              )
            })}

            {/* 품질검증 결과 섹션 */}
            <div className="pt-2">
              <Button
                variant="ghost"
                className="w-full justify-between gap-2 text-sm h-9"
                onClick={() => setIsResultsOpen(!isResultsOpen)}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>품질검증 결과</span>
                </div>
                {isResultsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </Button>
              
              {isResultsOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {resultSubItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Button
                        key={item.href}
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-2 text-xs h-8',
                          isActive && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                        )}
                        onClick={() => router.push(item.href)}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {item.name}
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 지표DB 관리 */}
            {navItemsAfterResults.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2 text-sm h-9',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                  )}
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Button>
              )
            })}
          </nav>
          <nav className="p-3 border-t space-y-1 flex-shrink-0">
            {bottomNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2 text-sm h-9',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                  )}
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Button>
              )
            })}
          </nav>
        </aside>

        {/* Page Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
