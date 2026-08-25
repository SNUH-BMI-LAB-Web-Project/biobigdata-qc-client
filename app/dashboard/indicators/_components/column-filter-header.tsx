'use client'

import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import { SelectContent, SelectItem } from '@/components/ui/select'
import { cn } from '@/lib/utils'

/**
 * 열 제목 자체를 눌러 여는 필터 드롭다운.
 * 'all' 센티널은 호출부에서 undefined 로 변환해 서버에 보낸다.
 *
 * 테이블 컨테이너가 overflow-x-auto 라 일반 팝업은 잘리므로, 메뉴를 포털로 띄우는
 * Radix Select 를 쓴다. 트리거는 ui/select 의 SelectTrigger 대신 프리미티브를 직접
 * 감싼다 — 래퍼의 data-[size=*]:h-* 가 특이도 때문에 높이 오버라이드를 이긴다.
 */
export function ColumnFilterHeader({
  label,
  value,
  onChange,
  options,
  allLabel = '전체',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  allLabel?: string
}) {
  const active = value !== 'all'
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger
        aria-label={`${label} 필터`}
        title={active ? `${label}: ${selectedLabel}` : `${label} 필터`}
        className={cn(
          'flex h-7 w-full items-center gap-0.5 rounded px-1 text-xs font-medium',
          'outline-none transition-colors hover:bg-muted focus-visible:ring-ring/50 focus-visible:ring-[2px]',
          active ? 'text-primary' : 'text-foreground',
        )}
      >
        <span className="truncate">{label}</span>
        {active && (
          <span aria-hidden className="shrink-0 text-primary">
            {'•'}
          </span>
        )}
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="ml-auto size-3 shrink-0 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      {/*
        ui/select 의 SelectContent 는 popper 모드에서 뷰포트 높이를 트리거 높이
        (--radix-select-trigger-height) 로 고정한다. 트리거가 28px 인 이 헤더에서는
        메뉴가 한 줄 높이로 찌그러지므로 h-auto 로 되돌린다.
      */}
      <SelectContent
        align="start"
        className="min-w-[10rem] [&_[data-radix-select-viewport]]:h-auto"
      >
        <SelectItem value="all" className="text-xs">
          {allLabel}
        </SelectItem>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-xs"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectPrimitive.Root>
  )
}
