'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  icon: LucideIcon
  label: string
  onClick?: () => void
}

export function NavLink({ href, icon: Icon, label, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'w-full justify-start gap-2 text-sm h-9',
        isActive && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
      )}
      asChild
    >
      <Link href={href} onClick={onClick}>
        <Icon className="w-4 h-4" />
        {label}
      </Link>
    </Button>
  )
}
