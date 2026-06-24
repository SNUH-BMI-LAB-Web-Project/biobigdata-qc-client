'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CompactPagerProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

interface TablePagerHeaderProps extends CompactPagerProps {
  pageSize: number
  totalCount: number
  totalLabel?: string
  onPageSizeChange: (size: number) => void
}

export function CompactPager({ page, totalPages, onChange }: CompactPagerProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        disabled={page <= 1}
        onClick={() => onChange(Math.max(1, page - 1))}
      >
        {'이전'}
      </Button>
      <PageInput key={page} page={page} totalPages={totalPages} onChange={onChange} />
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        disabled={page >= totalPages}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
      >
        {'다음'}
      </Button>
    </div>
  )
}

function PageInput({ page, totalPages, onChange }: CompactPagerProps) {
  const [draft, setDraft] = useState(String(page))

  const submitPage = () => {
    const next = Number(draft)
    if (!Number.isFinite(next)) {
      setDraft(String(page))
      return
    }

    const clamped = Math.min(totalPages, Math.max(1, Math.trunc(next)))
    setDraft(String(clamped))
    if (clamped !== page) onChange(clamped)
  }

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Input
        value={draft}
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="이동할 페이지"
        className="h-7 w-12 px-2 text-center text-xs"
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
        onBlur={submitPage}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur()
          }
          if (e.key === 'Escape') {
            setDraft(String(page))
            e.currentTarget.blur()
          }
        }}
      />
      <span>{'/'}</span>
      <span className="min-w-5">{totalPages}</span>
    </div>
  )
}

export function TablePagerHeader({
  page,
  pageSize,
  totalCount,
  totalPages,
  totalLabel,
  onChange,
  onPageSizeChange,
}: TablePagerHeaderProps) {
  const startIndex = (page - 1) * pageSize

  return (
    <CardHeader className="pb-3 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          {totalLabel && <span className="font-medium">{totalLabel}</span>}
          <span className="text-muted-foreground">{'페이지당 표시'}</span>
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="h-8 w-[92px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">{'5개'}</SelectItem>
              <SelectItem value="10">{'10개'}</SelectItem>
              <SelectItem value="20">{'20개'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {totalCount === 0 ? 0 : startIndex + 1}
            {'-'}
            {Math.min(startIndex + pageSize, totalCount)}
            {' / '}
            {totalCount}
            {'개'}
          </span>
          <CompactPager page={page} totalPages={totalPages} onChange={onChange} />
        </div>
      </div>
    </CardHeader>
  )
}
