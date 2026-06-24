// 데이터 품질 결과 화면 공용 헬퍼

/** 통과율 점수 색상: >=90 녹색 / 80~90 주황 / <80 빨강 */
export function getScoreColor(score: number) {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-orange-500'
  return 'text-red-600'
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** ISO datetime → 'YYYY-MM-DD HH:mm:ss' */
export function formatDatetime(value: string | null | undefined) {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}
