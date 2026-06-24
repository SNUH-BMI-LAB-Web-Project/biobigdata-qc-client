// 지표 상세 화면 공용 헬퍼

/** isActive(문자열) → 활성 여부 */
export const isActiveFlag = (value: string) => {
  const v = (value ?? '').toString().trim().toLowerCase()
  return v === '1' || v === 'y' || v === 'true' || v === 'active' || v === '활성'
}

export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

/** 통과율 점수 색상: >=90 녹색 / 80~90 주황 / <80 빨강 */
export const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-orange-600'
  return 'text-red-600'
}
