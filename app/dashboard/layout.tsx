'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Database, LogOut, User, LayoutDashboard, Table, Settings, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SettingsPanel } from '@/components/settings-panel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleLogout = () => {
    router.push('/')
  }

  const handleProfile = () => {
    router.push('/profile')
  }

  const navItems = [
    { name: '품질검증 대시보드', href: '/dashboard', icon: LayoutDashboard },
    { name: '데이터 통계', href: '/dashboard/data', icon: BarChart3 },
    { name: '지표DB 관리', href: '/dashboard/indicators', icon: Table },
  ]

  const bottomNavItems = [
    { name: '설정', icon: Settings },
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
            <Button
              variant={settingsOpen ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-2 text-sm h-9',
                settingsOpen && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
              )}
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-4 h-4" />
              설정
            </Button>
          </nav>
          <nav className="p-3 border-t space-y-1 flex-shrink-0">
            <Button
              variant={pathname === '/profile' ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-2 text-sm h-9',
                pathname === '/profile' && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
              )}
              onClick={handleProfile}
            >
              <User className="w-4 h-4" />
              마이페이지
            </Button>
          </nav>
        </aside>

        {/* Page Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-4xl h-[80vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>설정</DialogTitle>
            <DialogDescription>시스템 설정 및 관리</DialogDescription>
          </DialogHeader>
          <SettingsPanel />
        </DialogContent>
      </Dialog>
    </div>
  )
}
