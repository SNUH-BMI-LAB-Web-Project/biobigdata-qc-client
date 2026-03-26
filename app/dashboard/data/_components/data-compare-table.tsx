'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { TabDef } from '../_data/tabs'

function StatsCell({ tab }: { tab: TabDef }) {
  return (
    <div className="flex flex-nowrap items-center gap-x-3 overflow-x-auto overflow-y-hidden py-0.5 [-webkit-overflow-scrolling:touch] text-[11px] leading-none sm:gap-x-4 sm:text-xs">
      {tab.stats.map((s, i) => (
        <span key={s.label} className="inline-flex shrink-0 items-baseline gap-1.5 whitespace-nowrap">
          {i > 0 && (
            <span className="select-none text-muted-foreground/40" aria-hidden>
              |
            </span>
          )}
          <span className="text-muted-foreground">{s.label}</span>
          <span className="font-semibold tabular-nums text-foreground">{s.value}</span>
        </span>
      ))}
    </div>
  )
}

function DomainCell({ tab }: { tab: TabDef }) {
  const Icon = tab.icon
  return (
    <div className="flex min-w-0 items-start gap-1.5">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium leading-snug break-words">{tab.label}</div>
        <div className="text-[9px] leading-tight text-muted-foreground">({tab.sublabel})</div>
      </div>
    </div>
  )
}

interface DataSingleDbTableProps {
  tabs: TabDef[]
  description: string
  columnHeading: string
}

export function DataSingleDbTable({ tabs, description, columnHeading }: DataSingleDbTableProps) {
  if (tabs.length === 0) {
    return (
      <div className="text-muted-foreground rounded-md border px-4 py-8 text-center text-xs">
        선택된 영역이 없습니다. 위에서 표시할 영역을 선택해 주세요.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className="table-fixed">
        <colgroup>
          <col className="w-[7rem] sm:w-[8rem]" />
          <col />
        </colgroup>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead
              colSpan={2}
              className="box-border px-2.5 py-2.5 text-left align-top whitespace-normal sm:px-3"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold sm:text-sm">{columnHeading}</span>
                <p className="text-[11px] font-normal leading-snug text-muted-foreground sm:text-xs">
                  {description}
                </p>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tabs.map(tab => (
            <TableRow key={tab.value} className="align-top">
              <TableCell className="box-border w-[7rem] max-w-[7rem] px-2.5 py-2 align-top sm:w-[8rem] sm:max-w-[8rem] sm:px-3">
                <DomainCell tab={tab} />
              </TableCell>
              <TableCell className="border-l bg-muted/10 px-2 py-2 whitespace-normal align-top">
                <StatsCell tab={tab} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
