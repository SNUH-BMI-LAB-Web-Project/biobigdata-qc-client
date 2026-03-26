'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Database, User, LayoutDashboard, Table, Settings, BarChart3, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SettingsPanel } from '@/components/settings-panel'
import { ProfilePanel } from '@/components/profile-panel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    router.push('/')
  }

  const navItems = [
    { name: '품질검증 대시보드', href: '/dashboard', icon: LayoutDashboard },
    { name: '데이터 통계', href: '/dashboard/data', icon: BarChart3 },
    { name: '지표DB 관리', href: '/dashboard/indicators', icon: Table },
  ]

  const handleNavClick = (href: string) => {
    router.push(href)
    setMobileMenuOpen(false)
  }

  const navContent = (
    <>
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
              onClick={() => handleNavClick(item.href)}
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
          onClick={() => { setSettingsOpen(true); setMobileMenuOpen(false) }}
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
          onClick={() => { setProfileOpen(true); setMobileMenuOpen(false) }}
        >
          <User className="w-4 h-4" />
          김철수
        </Button>
      </nav>
    </>
  )

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="border-b bg-card flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push('/dashboard')}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Database className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-bold">BIKO-DQM</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">품질관리 대시보드</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2" />
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation - Desktop */}
        <aside className="w-48 border-r bg-card hidden md:flex flex-col flex-shrink-0">
          {navContent}
        </aside>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-56 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>메뉴</SheetTitle>
              <SheetDescription>네비게이션 메뉴</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col h-full pt-12">
              {navContent}
            </div>
          </SheetContent>
        </Sheet>

        {/* Page Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] sm:h-[80vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>설정</DialogTitle>
            <DialogDescription>시스템 설정 및 관리</DialogDescription>
          </DialogHeader>
          <SettingsPanel />
        </DialogContent>
      </Dialog>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] sm:h-[80vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>마이페이지</DialogTitle>
            <DialogDescription>프로필 정보 및 활동 통계</DialogDescription>
          </DialogHeader>
          <ProfilePanel onLogout={handleLogout} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
