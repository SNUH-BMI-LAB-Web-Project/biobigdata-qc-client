import { getPeriodLabels, type TimePeriod } from './score-history'

export type StatsVolumePoint = {
  month: string
  patients: number
  visits: number
  totalRecords: number
}

export type StatsVolumePeriodMap = Record<TimePeriod, StatsVolumePoint[]>

export type DualStatsVolumePoint = {
  month: string
  patientsA: number
  visitsA: number
  recordsA: number
  patientsB: number
  visitsB: number
  recordsB: number
}

export type DualStatsVolumePeriodMap = Record<TimePeriod, DualStatsVolumePoint[]>

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashCode(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function generateVolumePoints(
  current: { patients: number; visits: number; totalRecords: number },
  seed: number,
  labels: string[],
): StatsVolumePoint[] {
  const rng = seededRandom(seed)
  const n = labels.length
  const points: StatsVolumePoint[] = []

  let p = current.patients * (0.62 + rng() * 0.2)
  let v = current.visits * (0.62 + rng() * 0.2)
  let t = current.totalRecords * (0.62 + rng() * 0.2)

  for (let i = 0; i < n; i++) {
    if (i === n - 1) {
      p = current.patients
      v = current.visits
      t = current.totalRecords
    } else {
      // 데이터 통계 차트에서 추세가 육안으로 보이도록 변동폭을 키웁니다.
      p = Math.max(0, p + (rng() - 0.48) * current.patients * 0.09)
      v = Math.max(0, v + (rng() - 0.48) * current.visits * 0.09)
      t = Math.max(0, t + (rng() - 0.48) * current.totalRecords * 0.09)
    }
    points.push({
      month: labels[i],
      patients: Math.round(p),
      visits: Math.round(v),
      totalRecords: Math.round(t),
    })
  }

  return points
}

function buildVolumeMap(
  current: { patients: number; visits: number; totalRecords: number },
  baseSeed: number,
): StatsVolumePeriodMap {
  const periods: TimePeriod[] = ['all', 'year', 'month', 'week']
  const result = {} as StatsVolumePeriodMap
  for (const period of periods) {
    const labels = getPeriodLabels(period)
    const offset = periods.indexOf(period)
    result[period] = generateVolumePoints(current, baseSeed + offset, labels)
  }
  return result
}

export function generateDbStatsVolumeHistory(
  stats: { patients: number; visits: number; totalRecords: number },
  dbKey: string,
): StatsVolumePeriodMap {
  return buildVolumeMap(stats, hashCode(dbKey + '_stats_volume'))
}

export function generateDualStatsVolumeHistory(
  statsA: { patients: number; visits: number; totalRecords: number },
  statsB: { patients: number; visits: number; totalRecords: number },
  mergeKey: string,
): DualStatsVolumePeriodMap {
  const mapA = buildVolumeMap(statsA, hashCode(mergeKey + '_A_stats'))
  const mapB = buildVolumeMap(statsB, hashCode(mergeKey + '_B_stats'))
  const periods: TimePeriod[] = ['all', 'year', 'month', 'week']
  const out = {} as DualStatsVolumePeriodMap

  for (const p of periods) {
    out[p] = mapA[p].map((row, i) => ({
      month: row.month,
      patientsA: row.patients,
      visitsA: row.visits,
      recordsA: row.totalRecords,
      patientsB: mapB[p][i].patients,
      visitsB: mapB[p][i].visits,
      recordsB: mapB[p][i].totalRecords,
    }))
  }
  return out
}
