/** 지표 상세 모달 — 적용 대상 테이블·컬럼 행 (데모 데이터) */
export type IndicatorTargetRow = {
  id: string
  dbLabel: string
  tableName: string
  columnName: string
  score: number
  lastModified: string
  applied: boolean
}

export const INDICATOR_TARGET_ROWS: IndicatorTargetRow[] = [
  { id: 't1', dbLabel: '환자 진료 DB', tableName: 'patients', columnName: 'patient_id', score: 98.2, lastModified: '2024-01-15', applied: true },
  { id: 't2', dbLabel: '환자 진료 DB', tableName: 'patients', columnName: 'name', score: 97.5, lastModified: '2024-01-15', applied: true },
  { id: 't3', dbLabel: '환자 진료 DB', tableName: 'patients', columnName: 'birth_date', score: 96.8, lastModified: '2024-01-15', applied: true },
  { id: 't4', dbLabel: '환자 진료 DB', tableName: 'visits', columnName: 'visit_id', score: 95.1, lastModified: '2024-01-10', applied: true },
  { id: 't5', dbLabel: '환자 진료 DB', tableName: 'visits', columnName: 'patient_id', score: 94.6, lastModified: '2024-01-10', applied: true },
  { id: 't6', dbLabel: '환자 진료 DB', tableName: 'visits', columnName: 'visit_date', score: 93.9, lastModified: '2024-01-10', applied: true },
  { id: 't7', dbLabel: '환자 진료 DB', tableName: 'medical_records', columnName: 'record_id', score: 88.4, lastModified: '2024-01-12', applied: false },
  { id: 't8', dbLabel: '환자 진료 DB', tableName: 'medical_records', columnName: 'diagnosis', score: 87.2, lastModified: '2024-01-12', applied: false },
  { id: 't9', dbLabel: '임상시험 DB', tableName: 'subjects', columnName: 'subject_id', score: 96.3, lastModified: '2024-01-12', applied: true },
  { id: 't10', dbLabel: '임상시험 DB', tableName: 'subjects', columnName: 'enrollment_date', score: 95.7, lastModified: '2024-01-12', applied: true },
  { id: 't11', dbLabel: '임상시험 DB', tableName: 'trial_data', columnName: 'trial_id', score: 94.2, lastModified: '2024-01-14', applied: true },
  { id: 't12', dbLabel: '임상시험 DB', tableName: 'trial_data', columnName: 'outcome', score: 92.8, lastModified: '2024-01-14', applied: true },
  { id: 't13', dbLabel: '임상시험 DB', tableName: 'trial_data', columnName: 'notes', score: 91.5, lastModified: '2024-01-14', applied: true },
]
