export type IndicatorDetail = {
  name: string
  category: string
  description: string
  score: number
  db1Score: number
  db2Score: number
  weight: number
  threshold: number
  lastModified: string
  appliedDate: string
  tableColumnResults: TableColumnResult[]
}

export type TableColumnResult = {
  db: string
  table: string
  column: string
  score: number
  isActive: boolean
  lastChecked: string
}

export type QualityIndicator = {
  name: string
  score: number
}

export type QualityCategory = {
  name: string
  score: number
  indicators: QualityIndicator[]
}

export type DatabaseInfo = {
  name: string
  totalScore: number
  lastValidation: string
  stats: {
    patients: number
    visits: number
    totalRecords: number
  }
  categories: QualityCategory[]
}

export const qualityData: Record<'db1' | 'db2', DatabaseInfo> = {
  db1: {
    name: '환자 진료 DB (KR-CDI)',
    totalScore: 94.5,
    lastValidation: '2024-01-15 14:30',
    stats: { patients: 15234, visits: 48567, totalRecords: 125890 },
    categories: [
      {
        name: '완전성',
        score: 96.2,
        indicators: [
          { name: '필수 항목 완전성', score: 98.5 },
          { name: '선택 항목 완전성', score: 94.2 },
          { name: '레코드 완전성', score: 97.8 },
          { name: '시간 완전성', score: 95.6 },
          { name: '인구통계 완전성', score: 96.4 },
          { name: '진단 정보 완전성', score: 95.1 },
          { name: '처방 정보 완전성', score: 97.2 },
          { name: '검사 결과 완전성', score: 94.8 },
          { name: '종합 완전성', score: 96.0 },
        ],
      },
      {
        name: '정확성',
        score: 93.5,
        indicators: [
          { name: '데이터 형식 정확성', score: 95.2 },
          { name: '값 범위 정확성', score: 92.8 },
          { name: '코드 정확성', score: 94.5 },
          { name: '날짜 정확성', score: 91.2 },
          { name: '수치 정확성', score: 93.7 },
          { name: '참조 무결성', score: 95.8 },
          { name: '논리적 일관성', score: 92.1 },
          { name: '표준 준수율', score: 94.3 },
          { name: '종합 정확성', score: 93.6 },
        ],
      },
      {
        name: '일관성',
        score: 93.8,
        indicators: [
          { name: '시간적 일관성', score: 94.2 },
          { name: '데이터 간 일관성', score: 92.5 },
          { name: '형식 일관성', score: 95.8 },
          { name: '코드 일관성', score: 93.1 },
          { name: '중복 데이터 제거율', score: 94.7 },
          { name: '용어 일관성', score: 92.9 },
          { name: '단위 일관성', score: 95.2 },
          { name: '참조 일관성', score: 93.4 },
          { name: '종합 일관성', score: 93.9 },
        ],
      },
    ],
  },
  db2: {
    name: '임상시험 DB (통합 DB)',
    totalScore: 89.2,
    lastValidation: '2024-01-15 14:35',
    stats: { patients: 3456, visits: 12890, totalRecords: 45678 },
    categories: [
      {
        name: '완전성',
        score: 92.8,
        indicators: [
          { name: '필수 항목 완전성', score: 94.5 },
          { name: '선택 항목 완전성', score: 89.2 },
          { name: '레코드 완전성', score: 93.8 },
          { name: '시간 완전성', score: 91.6 },
          { name: '인구통계 완전성', score: 94.1 },
          { name: '진단 정보 완전성', score: 90.8 },
          { name: '처방 정보 완전성', score: 93.5 },
          { name: '검사 결과 완전성', score: 92.2 },
          { name: '종합 완전성', score: 92.9 },
        ],
      },
      {
        name: '정확성',
        score: 89.8,
        indicators: [
          { name: '데이터 형식 정확성', score: 91.2 },
          { name: '값 범위 정확성', score: 88.5 },
          { name: '코드 정확성', score: 90.1 },
          { name: '날짜 정확성', score: 87.8 },
          { name: '수치 정확성', score: 89.9 },
          { name: '참조 무결성', score: 92.3 },
          { name: '논리적 일관성', score: 88.2 },
          { name: '표준 준수율', score: 90.5 },
          { name: '종합 정확성', score: 89.8 },
        ],
      },
      {
        name: '일관성',
        score: 91.0,
        indicators: [
          { name: '시간적 일관성', score: 92.1 },
          { name: '데이터 간 일관성', score: 89.8 },
          { name: '형식 일관성', score: 93.2 },
          { name: '코드 일관성', score: 90.5 },
          { name: '중복 데이터 제거율', score: 91.8 },
          { name: '용어 일관성', score: 89.5 },
          { name: '단위 일관성', score: 92.7 },
          { name: '참조 일관성', score: 90.4 },
          { name: '종합 일관성', score: 91.2 },
        ],
      },
    ],
  },
}

export function buildIndicatorDetail(
  dbKey: 'db1' | 'db2',
  categoryIndex: number,
  indicatorIndex: number
): IndicatorDetail {
  const data = qualityData[dbKey]
  const otherData = dbKey === 'db1' ? qualityData.db2 : qualityData.db1
  const category = data.categories[categoryIndex]
  const indicator = category.indicators[indicatorIndex]
  const otherIndicator = otherData.categories[categoryIndex].indicators[indicatorIndex]

  return {
    name: indicator.name,
    category: category.name,
    description: `${category.name} 관련 품질 검증 지표입니다`,
    score: indicator.score,
    db1Score: dbKey === 'db1' ? indicator.score : otherIndicator.score,
    db2Score: dbKey === 'db2' ? indicator.score : otherIndicator.score,
    weight: 8 + (indicatorIndex % 3),
    threshold: 90 + (indicatorIndex % 6),
    lastModified: '2024-01-15',
    appliedDate: '2024-01-10',
    tableColumnResults: [
      { db: '환자 진료 DB', table: 'patients', column: 'patient_id', score: indicator.score + 2, isActive: true, lastChecked: '2024-01-15 10:00' },
      { db: '환자 진료 DB', table: 'patients', column: 'name', score: indicator.score - 1, isActive: true, lastChecked: '2024-01-15 10:00' },
      { db: '환자 진료 DB', table: 'patients', column: 'birth_date', score: indicator.score + 1, isActive: true, lastChecked: '2024-01-15 10:00' },
      { db: '환자 진료 DB', table: 'visits', column: 'visit_id', score: indicator.score - 2, isActive: true, lastChecked: '2024-01-15 10:05' },
      { db: '환자 진료 DB', table: 'visits', column: 'visit_date', score: indicator.score, isActive: false, lastChecked: '2024-01-14 14:30' },
      { db: '환자 진료 DB', table: 'medical_records', column: 'record_id', score: indicator.score + 3, isActive: true, lastChecked: '2024-01-15 10:10' },
      { db: '환자 진료 DB', table: 'medical_records', column: 'diagnosis', score: indicator.score - 3, isActive: true, lastChecked: '2024-01-15 10:10' },
      { db: '임상시험 DB', table: 'subjects', column: 'subject_id', score: otherIndicator.score + 1, isActive: true, lastChecked: '2024-01-15 10:12' },
      { db: '임상시험 DB', table: 'subjects', column: 'enrollment_date', score: otherIndicator.score - 1, isActive: true, lastChecked: '2024-01-15 10:12' },
      { db: '임상시험 DB', table: 'trial_data', column: 'trial_id', score: otherIndicator.score + 2, isActive: true, lastChecked: '2024-01-14 14:00' },
      { db: '임상시험 DB', table: 'trial_data', column: 'outcome', score: otherIndicator.score - 2, isActive: true, lastChecked: '2024-01-14 14:00' },
      { db: '임상시험 DB', table: 'trial_data', column: 'notes', score: otherIndicator.score, isActive: false, lastChecked: '2024-01-14 14:00' },
    ],
  }
}
