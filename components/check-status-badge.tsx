'use client'

import { Badge } from '@/components/ui/badge'
import { RUN_STATUS_LABEL } from '@/lib/api'
import type { RunStatus } from '@/lib/api'

function checkStatusClass(status: RunStatus): string {
  switch (status) {
    case 1:
      return 'bg-green-100 text-green-800 hover:bg-green-100'
    case 0:
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    case 2:
      return 'bg-red-100 text-red-800 hover:bg-red-100'
    case 3:
    default:
      return 'bg-gray-100 text-gray-700 hover:bg-gray-100'
  }
}

export function CheckStatusBadge({ status }: { status: RunStatus }) {
  return (
    <Badge
      variant="secondary"
      className={`text-xs ${checkStatusClass(status)}`}
    >
      {RUN_STATUS_LABEL[status] ?? '-'}
    </Badge>
  )
}
