'use client'

import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'
import { RefreshingContent } from '@/components/async-state'
import { isY } from './indicator-utils'
import type { DqFieldResponse, PageResult } from '@/lib/api'

export function FieldsPanel({ tableId }: { tableId: string }) {
  const { data, isInitialLoading, isRefetching, error, refetch } = useApi(
    async (signal) =>
      unwrapGeneratedResult<PageResult<DqFieldResponse>>(
        await generatedApi.GET('/api/qc/tables/{tableId}/fields', {
          params: { path: { tableId }, query: { page: 1, size: 200 } },
          signal,
        }),
      ),
    [tableId],
  )

  const fields = data?.items ?? []

  if (isInitialLoading) {
    return (
      <div className="px-8 py-6 text-center">
        <Loader2 className="w-4 h-4 mx-auto animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-8 py-6 text-center">
        <p className="text-xs text-destructive mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          {'다시 시도'}
        </Button>
      </div>
    )
  }

  if (fields.length === 0) {
    return (
      <p className="px-8 py-4 text-xs text-muted-foreground">
        {'컬럼 정의(dq_field)가 없습니다.'}
      </p>
    )
  }

  return (
    <div className="px-8 py-3">
      <p className="text-xs font-semibold text-muted-foreground mb-2">
        {'컬럼(dq_field) '}
        {fields.length}
        {'개'}
      </p>
      <RefreshingContent isRefetching={isRefetching}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 text-xs">{'컬럼ID'}</TableHead>
              <TableHead className="text-xs">{'컬럼명'}</TableHead>
              <TableHead className="text-xs">{'타입'}</TableHead>
              <TableHead className="w-16 text-center text-xs">{'필수'}</TableHead>
              <TableHead className="w-12 text-center text-xs">{'PK'}</TableHead>
              <TableHead className="w-12 text-center text-xs">{'FK'}</TableHead>
              <TableHead className="text-xs">{'FK참조테이블'}</TableHead>
              <TableHead className="text-xs">{'FK참조컬럼'}</TableHead>
              <TableHead className="w-12 text-center text-xs">{'사용'}</TableHead>
              <TableHead className="text-xs">{'설명'}</TableHead>
              <TableHead className="text-xs">{'상세설명'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.fieldId}>
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {field.fieldId}
                </TableCell>
                <TableCell className="text-xs font-mono font-medium">{field.fieldName}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {field.datatype}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-xs">{isY(field.isRequired) ? 'Y' : 'N'}</TableCell>
                <TableCell className="text-center text-xs">{isY(field.isPk) ? 'Y' : '-'}</TableCell>
                <TableCell className="text-center text-xs">{isY(field.isFk) ? 'Y' : '-'}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {field.fkTableName || '-'}
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {field.fkFieldName || '-'}
                </TableCell>
                <TableCell className="text-center text-xs">{isY(field.isEnable) ? 'Y' : 'N'}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{field.fieldDescription}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {field.fieldDescriptionDetail || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RefreshingContent>
    </div>
  )
}
