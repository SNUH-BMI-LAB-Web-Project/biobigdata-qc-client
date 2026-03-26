import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  iconClassName?: string
  className?: string
}

export function StatCard({ label, value, icon: Icon, iconClassName, className }: StatCardProps) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value

  return (
    <Card className={className}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0',
              iconClassName ?? 'bg-primary/10'
            )}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-0.5">{formattedValue}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatCardSimpleProps {
  label: string
  value: string | number
  className?: string
}

export function StatCardSimple({ label, value, className }: StatCardSimpleProps) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value

  return (
    <Card className={className}>
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold mt-1">{formattedValue}</div>
      </CardContent>
    </Card>
  )
}
