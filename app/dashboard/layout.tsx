'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { DashboardHeader } from './_components/dashboard-header'
import { DashboardSidebar } from './_components/dashboard-sidebar'

const SettingsPanel = dynamic(
  () => import('@/components/settings-panel').then(mod => ({ default: mod.SettingsPanel })),
  { loading: () => <DialogPlaceholder /> }
)

const ProfilePanel = dynamic(
  () => import('@/components/profile-panel').then(mod => ({ default: mod.ProfilePanel })),
  { loading: () => <DialogPlaceholder /> }
)

function DialogPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-muted-foreground text-sm">불러오는 중...</div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])

  const handleLogout = useCallback(() => {
    router.push('/')
  }, [router])

  const handleSettingsOpen = useCallback(() => {
    setSettingsOpen(true)
    setMobileMenuOpen(false)
  }, [])

  const handleProfileOpen = useCallback(() => {
    setProfileOpen(true)
    setMobileMenuOpen(false)
  }, [])

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <DashboardHeader onMenuOpen={() => setMobileMenuOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-48 border-r bg-card hidden md:flex flex-col flex-shrink-0">
          <DashboardSidebar
            settingsOpen={settingsOpen}
            profileOpen={profileOpen}
            onSettingsOpen={handleSettingsOpen}
            onProfileOpen={handleProfileOpen}
          />
        </aside>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-56 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>메뉴</SheetTitle>
              <SheetDescription>네비게이션 메뉴</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col h-full pt-12">
              <DashboardSidebar
                settingsOpen={settingsOpen}
                profileOpen={profileOpen}
                onSettingsOpen={handleSettingsOpen}
                onProfileOpen={handleProfileOpen}
                onNavClick={closeMobileMenu}
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {settingsOpen && (
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] sm:h-[80vh] p-0 gap-0 overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>설정</DialogTitle>
              <DialogDescription>시스템 설정 및 관리</DialogDescription>
            </DialogHeader>
            <SettingsPanel />
          </DialogContent>
        </Dialog>
      )}

      {profileOpen && (
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] sm:h-[80vh] p-0 gap-0 overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>마이페이지</DialogTitle>
              <DialogDescription>프로필 정보 및 활동 통계</DialogDescription>
            </DialogHeader>
            <ProfilePanel onLogout={handleLogout} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
