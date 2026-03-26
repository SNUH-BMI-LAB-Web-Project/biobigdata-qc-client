export type ScorePoint = {
  month: string
  score: number
}

const MONTHS = [
  '2023-08', '2023-09', '2023-10', '2023-11', '2023-12', '2024-01',
]

const MONTH_LABELS = [
  '23.08', '23.09', '23.10', '23.11', '23.12', '24.01',
]

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function generateHistory(currentScore: number, seed: number): ScorePoint[] {
  const rng = seededRandom(seed)
  const points: ScorePoint[] = []

  let score = currentScore - 3 - rng() * 4

  for (let i = 0; i < MONTHS.length; i++) {
    if (i === MONTHS.length - 1) {
      score = currentScore
    } else {
      const drift = (rng() - 0.35) * 2.5
      score = Math.min(100, Math.max(60, score + drift))
    }
    points.push({ month: MONTH_LABELS[i], score: Math.round(score * 10) / 10 })
  }

  return points
}

export function generateDbTotalHistory(currentScore: number, dbKey: string): ScorePoint[] {
  return generateHistory(currentScore, hashCode(dbKey + '_total'))
}

export function generateCategoryHistory(currentScore: number, dbKey: string, categoryName: string): ScorePoint[] {
  return generateHistory(currentScore, hashCode(dbKey + '_cat_' + categoryName))
}

export function generateIndicatorHistory(currentScore: number, dbKey: string, categoryName: string, indicatorName: string): ScorePoint[] {
  return generateHistory(currentScore, hashCode(dbKey + '_ind_' + categoryName + '_' + indicatorName))
}

export function generateDualDbHistory(
  db1Score: number,
  db2Score: number,
  indicatorName: string
): { month: string; db1: number; db2: number }[] {
  const h1 = generateHistory(db1Score, hashCode('db1_detail_' + indicatorName))
  const h2 = generateHistory(db2Score, hashCode('db2_detail_' + indicatorName))

  return h1.map((p, i) => ({
    month: p.month,
    db1: p.score,
    db2: h2[i].score,
  }))
}

function hashCode(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}
