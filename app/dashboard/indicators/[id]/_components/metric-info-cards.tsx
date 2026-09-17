import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { DqQualityMetricDetailResponse } from '@/lib/api'
import { getScoreColor, isFiniteNumber } from './detail-utils'

const rowCount = (n: number | undefined | null) =>
  typeof n === 'number' ? n.toLocaleString() : '-'

/** 지표 정보 + 최근 검증 결과 (좌우 2개 카드) */
export function MetricInfoCards({
  detail,
}: {
  detail: DqQualityMetricDetailResponse
}) {
  // API 가 최신순으로 내려주므로 그대로 쓴다 (표는 최신이 위)
  const results = detail.recentResults ?? []

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">지표 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">카테고리:</span>
            <Badge variant="outline">{detail.category}</Badge>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground shrink-0">설명:</span>
            <span className="text-right">{detail.metricDescription}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            최근 검증 결과
            <span className="ml-1 font-normal text-muted-foreground">
              ({results.length}건{results.length < 5 && ' / 최대 5건'})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className={results.length === 0 ? undefined : 'p-0'}>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              검증 결과가 없습니다.
            </p>
          ) : (
            <div className="border-t">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">실행일시</TableHead>
                    <TableHead className="text-xs text-right">대상</TableHead>
                    <TableHead className="text-xs text-right">위배</TableHead>
                    <TableHead className="text-xs text-right">통과율</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.runId}>
                      <TableCell
                        className="text-xs"
                        title={`실행 ID: ${r.runId}`}
                      >
                        {(r.runStartDatetime ?? '-').slice(0, 16)}
                      </TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground">
                        {rowCount(r.numDenominatorRows)}
                      </TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground">
                        {rowCount(r.numViolatedRows)}
                      </TableCell>
                      <TableCell
                        className={`text-xs text-right font-bold ${
                          isFiniteNumber(r.score)
                            ? getScoreColor(r.score)
                            : 'text-muted-foreground'
                        }`}
                      >
                        {isFiniteNumber(r.score) ? `${r.score.toFixed(1)}%` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
