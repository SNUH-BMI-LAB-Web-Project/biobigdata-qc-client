'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Info } from 'lucide-react'

/** "필수여부" 등급 안내 툴팁 (이 화면 전용 — Radix Tooltip을 직접 구성) */
export function RequiredInfoTooltip() {
  return (
    <TooltipPrimitive.Provider delayDuration={0}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex text-muted-foreground hover:text-foreground"
            aria-label="필수여부 등급 안내"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            sideOffset={4}
            className="bg-foreground text-background z-50 w-fit rounded-md px-3 py-1.5 text-xs text-left"
          >
            <div className="space-y-0.5">
              <div>{'Y · R (필수)'}</div>
              <div>{'R2 (조건부필수)'}</div>
              <div>{'O (선택)'}</div>
            </div>
            <TooltipPrimitive.Arrow className="fill-foreground" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
