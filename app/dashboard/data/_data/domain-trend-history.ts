import type { TimePeriod } from '@/app/dashboard/_data/score-history'
import { getPeriodLabels } from '@/app/dashboard/_data/score-history'
import { parseFirstStatNumeric, type TabDef } from './tabs'

export type DomainTrendPoint = {
  month: string
  patient: number | null
  clinical: number | null
}

function hashCode(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** 현재값(테이블의 첫 통계)을 말단으로 두고, 과거 구간은 완만한 증감으로 채웁니다. */
function generateSeriesToPresent(
  endValue: number,
  seed: number,
  labels: string[],
): number[] {
  const rng = seededRandom(seed)
  const n = labels.length
  const out: number[] = []
  let v = endValue * (0.75 + rng() * 0.18)
  for (let i = 0; i < n; i++) {
    if (i === n - 1) {
      v = endValue
    } else {
      v = Math.max(0, v + (rng() - 0.4) * Math.max(endValue, 1) * 0.032)
    }
    out.push(Math.round(v))
  }
  return out
}

export function buildDomainTrendSeries(
  period: TimePeriod,
  patientTab: TabDef | undefined,
  clinicalTab: TabDef | undefined,
): DomainTrendPoint[] {
  const labels = getPeriodLabels(period)
  const pEnd = patientTab ? parseFirstStatNumeric(patientTab) : null
  const cEnd = clinicalTab ? parseFirstStatNumeric(clinicalTab) : null

  const pSeed = hashCode(`${patientTab?.value ?? 'na'}_patient_${period}`)
  const cSeed = hashCode(`${clinicalTab?.value ?? 'na'}_clinical_${period}`)

  const pSeries =
    pEnd != null && patientTab != null
      ? generateSeriesToPresent(pEnd, pSeed, labels)
      : null
  const cSeries =
    cEnd != null && clinicalTab != null
      ? generateSeriesToPresent(cEnd, cSeed, labels)
      : null

  return labels.map((month, i) => ({
    month,
    patient: pSeries ? pSeries[i]! : null,
    clinical: cSeries ? cSeries[i]! : null,
  }))
}
