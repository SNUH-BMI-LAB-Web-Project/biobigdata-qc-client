'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface AsyncStateBlockProps {
  loading: boolean
  error: string | null
  empty: boolean
  emptyMessage: string
  loadingMessage?: string
  onRetry: () => void
  className?: string
}

export function LoadingBlock({ message = '불러오는 중...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-label="로딩 중" />
      {message}
    </div>
  )
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm">
      <p className="text-red-600">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        {'다시 시도'}
      </Button>
    </div>
  )
}

export function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}

export function AsyncStateBlock({
  loading,
  error,
  empty,
  emptyMessage,
  loadingMessage,
  onRetry,
}: AsyncStateBlockProps) {
  if (loading) return <LoadingBlock message={loadingMessage} />
  if (error) return <ErrorBlock message={error} onRetry={onRetry} />
  if (empty) return <EmptyBlock message={emptyMessage} />
  return null
}

export function TableStateRow({
  colSpan,
  loading,
  error,
  empty,
  onRetry,
  emptyMessage = '데이터가 없습니다.',
}: Omit<AsyncStateBlockProps, 'emptyMessage'> & {
  colSpan: number
  emptyMessage?: string
}) {
  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="py-10 text-center">
          <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" aria-label="로딩 중" />
        </TableCell>
      </TableRow>
    )
  }

  if (error) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="py-10 text-center">
          <p className="text-sm text-destructive mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            {'다시 시도'}
          </Button>
        </TableCell>
      </TableRow>
    )
  }

  if (empty) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="py-10 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </TableCell>
      </TableRow>
    )
  }

  return null
}

export function RefreshingContent({
  isRefetching,
  children,
  className,
}: {
  isRefetching: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('transition-opacity', isRefetching && 'opacity-50', className)}>
      {children}
    </div>
  )
}
