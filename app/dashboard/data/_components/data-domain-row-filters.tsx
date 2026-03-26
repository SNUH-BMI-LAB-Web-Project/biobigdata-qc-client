'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { getDomainFilterLabel, getOrderedDomainKeys, type TabDef } from '../_data/tabs'

export type DataDomainRowFiltersProps = {
  patientTabs: TabDef[]
  clinicalTabs: TabDef[]
  domainVisibility: Record<string, boolean>
  onToggleDomain: (key: string) => void
}

export function DataDomainRowFilters({
  patientTabs,
  clinicalTabs,
  domainVisibility,
  onToggleDomain,
}: DataDomainRowFiltersProps) {
  const keys = getOrderedDomainKeys(patientTabs, clinicalTabs)

  return (
    <div
      className="flex flex-col gap-2"
      role="group"
      aria-label="테이블에 표시할 영역"
    >
      <p className="text-muted-foreground text-xs font-medium">
        표시할 영역
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-2.5">
        {keys.map(key => {
          const id = `domain-row-${key}`
          return (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={id}
                checked={domainVisibility[key] ?? true}
                onCheckedChange={() => onToggleDomain(key)}
              />
              <Label
                htmlFor={id}
                className="cursor-pointer text-xs font-normal leading-none text-muted-foreground"
              >
                {getDomainFilterLabel(key, patientTabs, clinicalTabs)}
              </Label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
