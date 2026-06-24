import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { DqQualityMetricDetailResponse } from '@/lib/api'
import { isActiveFlag } from './detail-utils'

/** 지표 상세 상단 헤더 카드 — ID·이름·차원/검증단위/활성/생성일 */
export function MetricSummaryHeader({ detail }: { detail: DqQualityMetricDetailResponse }) {
  const active = isActiveFlag(detail.isActive)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">
              <span className="font-mono text-base text-muted-foreground mr-2">{detail.metricId}</span>
              {detail.metricNameKor}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <Badge variant="outline">{detail.category}</Badge>
              <Badge variant="secondary">{detail.metricLevel}</Badge>
              <Badge variant={active ? 'default' : 'secondary'}>{active ? '활성' : '비활성'}</Badge>
              <span>지표 생성일: {detail.createdAt}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
