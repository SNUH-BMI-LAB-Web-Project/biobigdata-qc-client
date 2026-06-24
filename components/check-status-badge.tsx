'use client'

import { Badge } from '@/components/ui/badge'
import { CHECK_STATUS_LABEL } from '@/lib/api'
import type { CheckStatus } from '@/lib/api'

function checkStatusClass(status: CheckStatus): string {
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

export function CheckStatusBadge({ status }: { status: CheckStatus }) {
  return (
    <Badge variant="secondary" className={`text-xs ${checkStatusClass(status)}`}>
      {CHECK_STATUS_LABEL[status] ?? '-'}
    </Badge>
  )
}
