'use client'

import { memo, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Clock, FileCheck, Activity, BarChart3,
  Download,
  LayoutGrid, Stethoscope, FlaskConical,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { ScoreText, ScoreBadge, getScoreColor, getScoreProgressIndicatorClass } from '@/components/score-display'
import { ScoreTrendChart } from './score-trend-chart'
import { DualScoreChart } from './dual-score-chart'
import { TimePeriodToggle } from './time-period-toggle'
import {
  generateDbTotalHistory,
  generateCategoryHistory,
  generateDualDbHistory,
  type TimePeriod,
} from '../_data/score-history'
import {
  generateDbStatsVolumeHistory,
  generateDualStatsVolumeHistory,
} from '../_data/stats-volume-history'
import {
  StatsCurrentValuesSummary,
  StatsMetricCheckboxes,
  type StatsMetricVisibility,
} from './data-stats-chart'
import { DataStatsRechartsChart } from './data-stats-recharts'
import type { DatabaseInfo } from '../_data/quality-data'
import { cn } from '@/lib/utils'

const DASHBOARD_TAB_ICONS = {
  all: LayoutGrid,
  patient: Stethoscope,
  clinical: FlaskConical,
} as const

const DASHBOARD_TAB_TITLES = {
  patient: '환자 진료 DB (KR-CDI)',
  clinical: '임상시험 DB (통합 DB)',
} as const

interface DatabaseSectionProps {
  dbKey: 'db1' | 'db2'
  data: DatabaseInfo
  /** 상단 TabsTrigger와 동일 아이콘 */
  dashboardTab: keyof typeof DASHBOARD_TAB_ICONS
  /** 있으면 총점·카테고리 추이 차트에 두 DB 선(환자/임상) 동시 표시 */
  compareData?: DatabaseInfo
  onIndicatorClick: (categoryIndex: number, indicatorIndex: number) => void
}

function DataStatActionButtons({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end',
        className
      )}
    >
      <Button size="sm" variant="outline" className="h-9 justify-center gap-2 px-2.5 text-sm sm:w-auto">
        <FileCheck className="h-3.5 w-3.5 shrink-0" />
        검증 실행
      </Button>
      <Button size="sm" variant="outline" className="h-9 justify-center gap-2 px-2.5 text-sm sm:w-auto">
        <Download className="h-3.5 w-3.5 shrink-0" />
        리포트
      </Button>
      <Button size="sm" variant="outline" className="h-9 justify-center gap-2 px-2.5 text-sm sm:w-auto">
        <Activity className="h-3.5 w-3.5 shrink-0" />
        이력
      </Button>
    </div>
  )
}

export const DatabaseSection = memo(function DatabaseSection({
  dbKey,
  data,
  dashboardTab,
  compareData,
  onIndicatorClick,
}: DatabaseSectionProps) {
  const HeaderIcon = DASHBOARD_TAB_ICONS[dashboardTab]
  const headerTitle = compareData
    ? '두 DB 품질 비교'
    : dashboardTab === 'patient' || dashboardTab === 'clinical'
      ? DASHBOARD_TAB_TITLES[dashboardTab]
      : data.name
  const [chartPeriod, setChartPeriod] = useState<TimePeriod>('week')
  const [statsPeriod, setStatsPeriod] = useState<TimePeriod>('week')
  const [categoryPeriods, setCategoryPeriods] = useState<Record<number, TimePeriod>>({})
  const [statsMetricVisible, setStatsMetricVisible] = useState<StatsMetricVisibility>({
    patients: true,
    visits: true,
    totalRecords: true,
  })
  const summaryMetricVisible: StatsMetricVisibility = useMemo(
    () => ({ patients: true, visits: true, totalRecords: true }),
    []
  )
  const statsMetricIdPrefix = `dashboard-stats-metric-${dashboardTab}-${dbKey}`
  const totalHistory = useMemo(
    () => generateDbTotalHistory(data.totalScore, dbKey),
    [data.totalScore, dbKey]
  )

  const categoryHistories = useMemo(
    () => data.categories.map(cat => generateCategoryHistory(cat.score, dbKey, cat.name)),
    [data.categories, dbKey]
  )

  const totalDualHistory = useMemo(
    () =>
      compareData
        ? generateDualDbHistory(data.totalScore, compareData.totalScore, 'dashboard_total_trend')
        : null,
    [data.totalScore, compareData]
  )

  const categoryDualHistories = useMemo(
    () =>
      compareData
        ? data.categories.map((cat, i) =>
            generateDualDbHistory(
              cat.score,
              compareData.categories[i].score,
              `${cat.name}_dashboard_cat_trend`
            )
          )
        : null,
    [data.categories, compareData]
  )

  const statsVolumeHistory = useMemo(
    () => generateDbStatsVolumeHistory(data.stats, dbKey),
    [data.stats, dbKey]
  )

  const dualStatsVolumeHistory = useMemo(
    () =>
      compareData
        ? generateDualStatsVolumeHistory(data.stats, compareData.stats, 'dashboard_data_stats')
        : null,
    [data.stats, compareData]
  )

  const latestStatsPoint = useMemo(() => {
    const map = dualStatsVolumeHistory ?? statsVolumeHistory
    const series = map[statsPeriod]
    if (!series?.length) return undefined
    return series[series.length - 1]
  }, [dualStatsVolumeHistory, statsVolumeHistory, statsPeriod])

  const totalDualChartHeight =
    dashboardTab === 'all'
      ? 'h-[230px] min-h-[230px] md:h-[270px] md:min-h-[270px] xl:h-[300px] xl:min-h-[300px]'
      : 'h-[220px] min-h-[220px] md:h-[260px] md:min-h-[260px] xl:h-[280px] xl:min-h-[280px]'

  const totalSingleChartHeight =
    dashboardTab === 'all'
      ? 'h-[210px] min-h-[210px] md:h-[250px] md:min-h-[250px] xl:h-[300px] xl:min-h-[300px]'
      : 'h-[200px] min-h-[200px] md:h-[240px] md:min-h-[240px] xl:h-[280px] xl:min-h-[280px]'

  return (
    <div className="space-y-4">
      {/* 제목 ~ 데이터통계·총점추이 행만 촘촘하게 */}
      <div className="space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
          <div className="flex items-center gap-2">
            <HeaderIcon className="h-5 w-5 shrink-0 text-foreground" aria-hidden />
            <h2 className="text-lg font-bold">{headerTitle}</h2>
          </div>
          {compareData && (
            <p className="text-sm text-muted-foreground sm:ml-1">
              {data.name} · {compareData.name}
            </p>
          )}
        </div>
        <DataStatActionButtons />
      </div>

      {/* xl: 첫 열은 통계 카드용 최대 560px, 둘째 열은 1fr로 품질검증 카드가 남는 가로 공간 전부 사용 */}
      <div className="grid min-w-0 grid-cols-1 gap-3 items-stretch xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)] xl:gap-4">
        {/* Data Statistics — 추이 그래프만 */}
        <Card className="flex min-h-0 w-full max-w-full flex-col gap-0 self-start py-4">
          <div className="flex min-w-0 flex-col gap-3 px-6 pb-1.5 pt-0">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="min-w-0">
                <CardTitle className="text-sm">데이터 통계</CardTitle>
              </div>
              <StatsCurrentValuesSummary
                mode={dualStatsVolumeHistory ? 'compare' : 'single'}
                visible={summaryMetricVisible}
                point={latestStatsPoint}
                className="w-full min-w-0 shrink-0"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <StatsMetricCheckboxes
                visible={statsMetricVisible}
                onToggle={key =>
                  setStatsMetricVisible(v => ({ ...v, [key]: !v[key] }))
                }
                idPrefix={statsMetricIdPrefix}
                className="min-w-0 w-full justify-start self-start sm:w-auto sm:max-w-[min(100%,22rem)]"
              />
              <TimePeriodToggle
                value={statsPeriod}
                onChange={setStatsPeriod}
                className="w-full justify-end sm:w-auto sm:justify-end"
                ariaLabel="데이터 통계 기간"
              />
            </div>
          </div>
          <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col px-6 pt-6">
            {dualStatsVolumeHistory ? (
              <DataStatsRechartsChart
                mode="compare"
                dataByPeriod={dualStatsVolumeHistory}
                period={statsPeriod}
                visible={summaryMetricVisible}
              />
            ) : (
              <DataStatsRechartsChart
                mode="single"
                dataByPeriod={statsVolumeHistory}
                period={statsPeriod}
                visible={summaryMetricVisible}
              />
            )}
          </CardContent>
        </Card>

        {/* 품질검증: xl에서 열 전체 너비 사용 · 넓을 때 헤더 가로 배치 */}
        <Card className="flex h-full min-h-0 min-w-0 w-full flex-col gap-0 overflow-hidden py-4">
          {/* CardHeader 기본 grid/@container가 행 너비를 막을 수 있어 flex 전용 래퍼 사용 */}
          <div className="flex w-full min-w-0 flex-col gap-4 px-6 pb-0 pt-0">
            {/* 제목(좌) | 우측: 총점 → 그 아래 기간 토글 */}
            <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm leading-snug break-words">
                  품질검증 실행 및 점수 추이
                </CardTitle>
              </div>
              <div className="flex w-full min-w-0 flex-col items-end gap-2 self-end sm:w-auto sm:self-auto sm:pt-0.5">
                <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground sm:text-right">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="max-w-[60vw] break-words sm:max-w-none">
                    마지막 검증: {data.lastValidation}
                  </span>
                </div>
              </div>
            </div>
            <div
              className={cn(
                'flex w-full min-w-0 items-center justify-between gap-3',
                dashboardTab === 'all' && 'mb-2'
              )}
            >
              <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-xs text-muted-foreground">현재 총점</span>
                {compareData ? (
                  <>
                    <ScoreText score={data.totalScore} className="text-lg sm:text-xl" />
                    <ScoreBadge score={data.totalScore} />
                    <span className="text-muted-foreground">/</span>
                    <ScoreText score={compareData.totalScore} className="text-lg sm:text-xl" />
                    <ScoreBadge score={compareData.totalScore} />
                  </>
                ) : (
                  <>
                    <ScoreText score={data.totalScore} className="text-lg sm:text-xl" />
                    <ScoreBadge score={data.totalScore} />
                  </>
                )}
              </div>
              <TimePeriodToggle
                value={chartPeriod}
                onChange={setChartPeriod}
                className="w-full justify-end sm:w-auto"
                ariaLabel="점수 추이 기간"
              />
            </div>
          </div>
          <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col px-6 pt-6">
            {totalDualHistory ? (
              <DualScoreChart
                dataByPeriod={totalDualHistory}
                height={totalDualChartHeight}
                period={chartPeriod}
                onPeriodChange={setChartPeriod}
                showPeriodToggle={false}
              />
            ) : (
              <ScoreTrendChart
                dataByPeriod={totalHistory}
                height={totalSingleChartHeight}
                series={dbKey}
                period={chartPeriod}
                onPeriodChange={setChartPeriod}
                showPeriodToggle={false}
              />
            )}
          </CardContent>
        </Card>
      </div>
      </div>

      {/* 카테고리별: 총점 추이 + 상세 지표 (완전성 / 정확성 / 일관성) */}
      <Card className="gap-0 py-4">
        <div className="flex w-full min-w-0 flex-col gap-3 px-6 pb-5 pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 shrink-0" />
              카테고리별 점수 추이 및 상세 지표
            </CardTitle>
            <CardDescription className="text-xs">
              완전성 · 정확성 · 일관성 카테고리별 추이와 하위 지표를 확인할 수 있습니다.
            </CardDescription>
          </div>
        </div>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-3 lg:gap-8">
            {data.categories.map((category, catIndex) => (
              <div
                key={category.name}
                className="flex min-w-0 flex-col gap-4 rounded-lg border border-border/70 bg-muted/20 p-4"
              >
                {/** 카테고리별 기간을 독립 제어 */}
                {(() => {
                  const categoryPeriod = categoryPeriods[catIndex] ?? 'week'
                  return (
                    <>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{category.name}</h3>
                    <p className="flex shrink-0 items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="truncate">마지막 검증: {data.lastValidation}</span>
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-wrap items-center justify-between gap-2">
                  <div
                    className={cn(
                      'flex shrink-0 flex-wrap items-center sm:pt-0.5',
                      compareData ? 'gap-x-1 gap-y-0.5' : 'gap-x-2 gap-y-1'
                    )}
                  >
                    <span
                      className={cn(
                        'text-muted-foreground',
                        compareData ? 'text-[10px]' : 'text-[10px] sm:text-xs'
                      )}
                    >
                      점수
                    </span>
                    {compareData ? (
                      <>
                        <ScoreText score={category.score} className="text-sm tabular-nums sm:text-base" />
                        <ScoreBadge score={category.score} className="text-[10px] px-1 py-0 font-normal leading-none" />
                        <span className="text-muted-foreground text-xs leading-none">/</span>
                        <ScoreText score={compareData.categories[catIndex].score} className="text-sm tabular-nums sm:text-base" />
                        <ScoreBadge score={compareData.categories[catIndex].score} className="text-[10px] px-1 py-0 font-normal leading-none" />
                      </>
                    ) : (
                      <>
                        <ScoreText score={category.score} className="text-lg sm:text-xl" />
                        <ScoreBadge score={category.score} />
                      </>
                    )}
                  </div>
                  <TimePeriodToggle
                    value={categoryPeriod}
                    onChange={next =>
                      setCategoryPeriods(prev => ({ ...prev, [catIndex]: next }))
                    }
                    className="w-full justify-end sm:w-auto"
                    ariaLabel={`${category.name} 점수 추이 기간`}
                  />
                </div>
                {categoryDualHistories ? (
                  <DualScoreChart
                    dataByPeriod={categoryDualHistories[catIndex]}
                    height="h-[160px]"
                    period={categoryPeriod}
                    onPeriodChange={next =>
                      setCategoryPeriods(prev => ({ ...prev, [catIndex]: next }))
                    }
                    showPeriodToggle={false}
                  />
                ) : (
                  <ScoreTrendChart
                    dataByPeriod={categoryHistories[catIndex]}
                    height="h-[160px]"
                    series={dbKey}
                    period={categoryPeriod}
                    onPeriodChange={next =>
                      setCategoryPeriods(prev => ({ ...prev, [catIndex]: next }))
                    }
                    showPeriodToggle={false}
                  />
                )}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                    상세 지표
                  </p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {category.indicators.map((indicator, indIndex) => (
                      <IndicatorCard
                        key={indicator.name}
                        indicator={indicator}
                        compareScore={compareData?.categories[catIndex]?.indicators[indIndex]?.score}
                        onClick={() => onIndicatorClick(catIndex, indIndex)}
                      />
                    ))}
                  </div>
                </div>
                    </>
                  )
                })()}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

const IndicatorCard = memo(function IndicatorCard({
  indicator,
  compareScore,
  onClick,
}: {
  indicator: { name: string; score: number }
  compareScore?: number
  onClick: () => void
}) {
  return (
    <div
      className="rounded border bg-card/50 px-2 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex min-w-0 flex-col gap-2.5">
        <div className="flex min-w-0 items-start gap-2">
          <h4 className="min-w-0 flex-1 text-xs font-medium leading-tight break-words">
            {indicator.name}
          </h4>
          <div className="flex shrink-0 items-baseline gap-1 text-right text-xs font-bold tabular-nums leading-none whitespace-nowrap">
            <span className={getScoreColor(indicator.score)}>{indicator.score}</span>
            {compareScore != null && (
              <>
                <span className="text-muted-foreground font-normal">/</span>
                <span className={getScoreColor(compareScore)}>{compareScore}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <Progress
            value={indicator.score}
            className="h-1 w-full min-w-0 bg-muted/70"
            indicatorClassName={getScoreProgressIndicatorClass(indicator.score)}
          />
          {compareScore != null && (
            <Progress
              value={compareScore}
              className="h-1 w-full min-w-0 bg-muted/70"
              indicatorClassName={getScoreProgressIndicatorClass(compareScore)}
            />
          )}
        </div>
      </div>
    </div>
  )
})
