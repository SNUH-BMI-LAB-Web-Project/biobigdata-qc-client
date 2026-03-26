'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Database, Menu } from 'lucide-react'

interface DashboardHeaderProps {
  onMenuOpen: () => void
}

export function DashboardHeader({ onMenuOpen }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-card flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={onMenuOpen}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-base font-bold">BIKO-DQM</h1>
          </Link>
        </div>
        <div className="flex items-center gap-2" />
      </div>
    </header>
  )
}
