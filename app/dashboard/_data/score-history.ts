export type ScorePoint = {
  month: string
  score: number
}

export type TimePeriod = 'all' | 'year' | 'month' | 'week'

export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  all: '전체',
  year: '년도',
  month: '월',
  week: '주',
}

const ALL_MONTHS = [
  '2022-01', '2022-02', '2022-03', '2022-04', '2022-05', '2022-06',
  '2022-07', '2022-08', '2022-09', '2022-10', '2022-11', '2022-12',
  '2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06',
  '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12',
  '2024-01',
]

const ALL_LABELS = [
  '22.01', '22.02', '22.03', '22.04', '22.05', '22.06',
  '22.07', '22.08', '22.09', '22.10', '22.11', '22.12',
  '23.01', '23.02', '23.03', '23.04', '23.05', '23.06',
  '23.07', '23.08', '23.09', '23.10', '23.11', '23.12',
  '24.01',
]

const YEAR_LABELS = ALL_LABELS.slice(-12)
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => `1/${i + 1}`)
const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일']

/** 차트·통계 시계열 등 기간별 X축 라벨 */
export function getPeriodLabels(period: TimePeriod): string[] {
  const labelsMap: Record<TimePeriod, string[]> = {
    all: ALL_LABELS,
    year: YEAR_LABELS,
    month: MONTH_DAYS,
    week: WEEK_DAYS,
  }
  return labelsMap[period]
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generatePoints(
  currentScore: number,
  seed: number,
  labels: string[],
): ScorePoint[] {
  const rng = seededRandom(seed)
  const points: ScorePoint[] = []

  let score = currentScore - 3 - rng() * 4

  for (let i = 0; i < labels.length; i++) {
    if (i === labels.length - 1) {
      score = currentScore
    } else {
      const drift = (rng() - 0.35) * 2.5
      score = Math.min(100, Math.max(60, score + drift))
    }
    points.push({ month: labels[i], score: Math.round(score * 10) / 10 })
  }

  return points
}

export type PeriodDataMap = Record<TimePeriod, ScorePoint[]>

function buildPeriodDataMap(currentScore: number, baseSeed: number): PeriodDataMap {
  return {
    all: generatePoints(currentScore, baseSeed, ALL_LABELS),
    year: generatePoints(currentScore, baseSeed + 1, YEAR_LABELS),
    month: generatePoints(currentScore, baseSeed + 2, MONTH_DAYS),
    week: generatePoints(currentScore, baseSeed + 3, WEEK_DAYS),
  }
}

export function generateHistory(currentScore: number, seed: number): ScorePoint[] {
  return generatePoints(currentScore, seed, YEAR_LABELS.slice(-6))
}

export function generateDbTotalHistory(currentScore: number, dbKey: string): PeriodDataMap {
  return buildPeriodDataMap(currentScore, hashCode(dbKey + '_total'))
}

export function generateCategoryHistory(currentScore: number, dbKey: string, categoryName: string): PeriodDataMap {
  return buildPeriodDataMap(currentScore, hashCode(dbKey + '_cat_' + categoryName))
}

export function generateIndicatorHistory(currentScore: number, dbKey: string, categoryName: string, indicatorName: string): PeriodDataMap {
  return buildPeriodDataMap(currentScore, hashCode(dbKey + '_ind_' + categoryName + '_' + indicatorName))
}

export type DualScorePoint = { month: string; db1: number; db2: number }
export type DualPeriodDataMap = Record<TimePeriod, DualScorePoint[]>

export function generateDualDbHistory(
  db1Score: number,
  db2Score: number,
  indicatorName: string
): DualPeriodDataMap {
  const baseSeed1 = hashCode('db1_detail_' + indicatorName)
  const baseSeed2 = hashCode('db2_detail_' + indicatorName)

  const periods: TimePeriod[] = ['all', 'year', 'month', 'week']
  const result = {} as DualPeriodDataMap

  for (const period of periods) {
    const labelsMap: Record<TimePeriod, string[]> = {
      all: ALL_LABELS,
      year: YEAR_LABELS,
      month: MONTH_DAYS,
      week: WEEK_DAYS,
    }
    const labels = labelsMap[period]
    const seedOffset = periods.indexOf(period)
    const h1 = generatePoints(db1Score, baseSeed1 + seedOffset, labels)
    const h2 = generatePoints(db2Score, baseSeed2 + seedOffset, labels)

    result[period] = h1.map((p, i) => ({
      month: p.month,
      db1: p.score,
      db2: h2[i].score,
    }))
  }

  return result
}

function hashCode(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}
