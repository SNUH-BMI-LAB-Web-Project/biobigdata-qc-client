'use client'

import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function RequiredInfoTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex text-muted-foreground hover:text-foreground"
          aria-label="필수여부 등급 안내"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-left">
        <div className="space-y-0.5">
          <div>{'Y · R (필수)'}</div>
          <div>{'R2 (조건부필수)'}</div>
          <div>{'O (선택)'}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
