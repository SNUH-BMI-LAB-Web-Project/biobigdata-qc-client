'use client'

import { memo, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Database, Clock, FileCheck, Activity, BarChart3,
  ChevronDown, ChevronUp, Download, Users, Calendar, HardDrive,
} from 'lucide-react'
import { ScoreText, ScoreBadge, getScoreColor } from '@/components/score-display'
import { ScoreTrendChart } from './score-trend-chart'
import { ScoreSparkline } from './score-sparkline'
import {
  generateDbTotalHistory,
  generateCategoryHistory,
  generateIndicatorHistory,
} from '../_data/score-history'
import type { DatabaseInfo } from '../_data/quality-data'

interface DatabaseSectionProps {
  dbKey: 'db1' | 'db2'
  data: DatabaseInfo
  expandedCategory: number | null
  onToggleCategory: (index: number) => void
  onIndicatorClick: (categoryIndex: number, indicatorIndex: number) => void
}

function StatItem({ icon: Icon, iconClassName, label, value }: {
  icon: React.ComponentType<{ className?: string }>
  iconClassName: string
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${iconClassName}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-bold">{value.toLocaleString()}</p>
      </div>
    </div>
  )
}

export const DatabaseSection = memo(function DatabaseSection({
  dbKey,
  data,
  expandedCategory,
  onToggleCategory,
  onIndicatorClick,
}: DatabaseSectionProps) {
  const totalHistory = useMemo(
    () => generateDbTotalHistory(data.totalScore, dbKey),
    [data.totalScore, dbKey]
  )

  const categoryHistories = useMemo(
    () => data.categories.map(cat => generateCategoryHistory(cat.score, dbKey, cat.name)),
    [data.categories, dbKey]
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <Database className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-lg font-bold">{data.name}</h2>
      </div>

      {/* Data Statistics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">데이터 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatItem icon={Users} iconClassName="bg-primary/10 text-primary" label="현재 환자 수" value={data.stats.patients} />
            <StatItem icon={Calendar} iconClassName="bg-accent/10 text-accent" label="전체 방문 수" value={data.stats.visits} />
            <StatItem icon={HardDrive} iconClassName="bg-secondary" label="전체 데이터 수" value={data.stats.totalRecords} />
          </div>
        </CardContent>
      </Card>

      {/* Quality Validation - Total Score Trend */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm">품질검증 실행 및 점수 추이</CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs mt-1">
                <Clock className="w-3 h-3" />
                마지막 검증: {data.lastValidation}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 mr-2">
                <span className="text-xs text-muted-foreground">현재 총점</span>
                <ScoreText score={data.totalScore} className="text-xl" />
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                <FileCheck className="w-3 h-3" />
                검증 실행
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                <Download className="w-3 h-3" />
                리포트
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                <Activity className="w-3 h-3" />
                이력
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScoreTrendChart data={totalHistory} height="h-[100px]" />
        </CardContent>
      </Card>

      {/* Category Scores with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {data.categories.map((category, index) => (
          <Card
            key={index}
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => onToggleCategory(index)}
          >
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium flex items-center justify-between">
                {category.name}
                {expandedCategory === index ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              <div className="flex items-center justify-between mb-1">
                <ScoreText score={category.score} className="text-xl" />
                <ScoreBadge score={category.score} />
              </div>
              <ScoreSparkline data={categoryHistories[index]} className="h-[32px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Indicators with Sparklines */}
      {expandedCategory !== null && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {data.categories[expandedCategory].name} - 상세 지표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {data.categories[expandedCategory].indicators.map((indicator, index) => (
                <IndicatorCard
                  key={index}
                  dbKey={dbKey}
                  categoryName={data.categories[expandedCategory].name}
                  indicator={indicator}
                  onClick={() => onIndicatorClick(expandedCategory, index)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
})

const IndicatorCard = memo(function IndicatorCard({
  dbKey,
  categoryName,
  indicator,
  onClick,
}: {
  dbKey: string
  categoryName: string
  indicator: { name: string; score: number }
  onClick: () => void
}) {
  const history = useMemo(
    () => generateIndicatorHistory(indicator.score, dbKey, categoryName, indicator.name),
    [indicator.score, dbKey, categoryName, indicator.name]
  )

  return (
    <div
      className="p-2 rounded border bg-card/50 space-y-1 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium leading-tight">{indicator.name}</h4>
        <span className={`text-sm font-bold ${getScoreColor(indicator.score)}`}>
          {indicator.score}
        </span>
      </div>
      <ScoreSparkline data={history} className="h-[24px] w-full" />
    </div>
  )
})
