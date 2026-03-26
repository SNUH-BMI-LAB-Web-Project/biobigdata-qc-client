export type Indicator = {
  id: number
  category: string
  name: string
  description: string
  db1Score: number
  db2Score: number
  weight: number
  threshold: number
  lastModified: string
  appliedDate: string
  isActive: boolean
}

export type TableInfo = {
  id: number
  db: string
  name: string
  description: string
  recordCount: number
  columnCount: number
  lastUpdated: string
  columns: {
    name: string
    type: string
    nullable: boolean
    description: string
  }[]
}

export const CATEGORIES = ['완전성', '정확성', '일관성'] as const

export const tablesData: TableInfo[] = [
  {
    id: 1, db: '환자 진료 DB (KR-CDI)', name: 'patients', description: '환자 기본 정보 테이블',
    recordCount: 15234, columnCount: 12, lastUpdated: '2024-01-15',
    columns: [
      { name: 'patient_id', type: 'VARCHAR(20)', nullable: false, description: '환자 고유 ID' },
      { name: 'name', type: 'VARCHAR(100)', nullable: false, description: '환자 성명' },
      { name: 'birth_date', type: 'DATE', nullable: false, description: '생년월일' },
      { name: 'gender', type: 'CHAR(1)', nullable: false, description: '성별 (M/F)' },
      { name: 'email', type: 'VARCHAR(200)', nullable: true, description: '이메일 주소' },
      { name: 'phone', type: 'VARCHAR(20)', nullable: true, description: '연락처' },
      { name: 'address', type: 'VARCHAR(500)', nullable: true, description: '주소' },
      { name: 'insurance_type', type: 'VARCHAR(50)', nullable: true, description: '보험 유형' },
      { name: 'registered_date', type: 'DATETIME', nullable: false, description: '등록일' },
      { name: 'last_visit_date', type: 'DATETIME', nullable: true, description: '마지막 방문일' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, description: '상태 (활성/비활성)' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
  {
    id: 2, db: '환자 진료 DB (KR-CDI)', name: 'visits', description: '환자 방문 기록 테이블',
    recordCount: 48567, columnCount: 10, lastUpdated: '2024-01-15',
    columns: [
      { name: 'visit_id', type: 'VARCHAR(20)', nullable: false, description: '방문 고유 ID' },
      { name: 'patient_id', type: 'VARCHAR(20)', nullable: false, description: '환자 ID (FK)' },
      { name: 'visit_date', type: 'DATE', nullable: false, description: '방문 날짜' },
      { name: 'visit_type', type: 'VARCHAR(50)', nullable: false, description: '방문 유형 (외래/입원/응급)' },
      { name: 'department', type: 'VARCHAR(100)', nullable: false, description: '진료과' },
      { name: 'doctor_id', type: 'VARCHAR(20)', nullable: false, description: '담당의 ID' },
      { name: 'admission_time', type: 'DATETIME', nullable: true, description: '입원 시간' },
      { name: 'discharge_time', type: 'DATETIME', nullable: true, description: '퇴원 시간' },
      { name: 'diagnosis_code', type: 'VARCHAR(20)', nullable: true, description: '진단 코드' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
  {
    id: 3, db: '환자 진료 DB (KR-CDI)', name: 'medical_records', description: '진료 기록 테이블',
    recordCount: 125890, columnCount: 9, lastUpdated: '2024-01-14',
    columns: [
      { name: 'record_id', type: 'VARCHAR(20)', nullable: false, description: '기록 고유 ID' },
      { name: 'visit_id', type: 'VARCHAR(20)', nullable: false, description: '방문 ID (FK)' },
      { name: 'patient_id', type: 'VARCHAR(20)', nullable: false, description: '환자 ID (FK)' },
      { name: 'diagnosis', type: 'TEXT', nullable: false, description: '진단 내용' },
      { name: 'treatment', type: 'TEXT', nullable: true, description: '치료 내용' },
      { name: 'prescription', type: 'TEXT', nullable: true, description: '처방 내용' },
      { name: 'notes', type: 'TEXT', nullable: true, description: '비고' },
      { name: 'record_date', type: 'DATETIME', nullable: false, description: '기록 일시' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
  {
    id: 4, db: '환자 진료 DB (KR-CDI)', name: 'lab_results', description: '검사 결과 테이블',
    recordCount: 89450, columnCount: 8, lastUpdated: '2024-01-15',
    columns: [
      { name: 'lab_id', type: 'VARCHAR(20)', nullable: false, description: '검사 고유 ID' },
      { name: 'patient_id', type: 'VARCHAR(20)', nullable: false, description: '환자 ID (FK)' },
      { name: 'test_name', type: 'VARCHAR(200)', nullable: false, description: '검사명' },
      { name: 'test_code', type: 'VARCHAR(50)', nullable: false, description: '검사 코드' },
      { name: 'result_value', type: 'VARCHAR(100)', nullable: true, description: '결과값' },
      { name: 'unit', type: 'VARCHAR(50)', nullable: true, description: '단위' },
      { name: 'test_date', type: 'DATETIME', nullable: false, description: '검사 일시' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
  {
    id: 5, db: '임상시험 DB (통합 DB)', name: 'subjects', description: '임상시험 참여자 테이블',
    recordCount: 3456, columnCount: 10, lastUpdated: '2024-01-15',
    columns: [
      { name: 'subject_id', type: 'VARCHAR(20)', nullable: false, description: '참여자 고유 ID' },
      { name: 'enrollment_date', type: 'DATE', nullable: false, description: '등록일' },
      { name: 'trial_id', type: 'VARCHAR(20)', nullable: false, description: '시험 ID (FK)' },
      { name: 'site_id', type: 'VARCHAR(20)', nullable: false, description: '기관 ID' },
      { name: 'age', type: 'INT', nullable: false, description: '나이' },
      { name: 'gender', type: 'CHAR(1)', nullable: false, description: '성별' },
      { name: 'consent_date', type: 'DATE', nullable: false, description: '동의서 날짜' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, description: '참여 상태' },
      { name: 'contact_info', type: 'VARCHAR(200)', nullable: true, description: '연락처' },
      { name: 'medical_history', type: 'TEXT', nullable: true, description: '병력' },
    ],
  },
  {
    id: 6, db: '임상시험 DB (통합 DB)', name: 'trial_data', description: '시험 데이터 테이블',
    recordCount: 45678, columnCount: 8, lastUpdated: '2024-01-14',
    columns: [
      { name: 'data_id', type: 'VARCHAR(20)', nullable: false, description: '데이터 고유 ID' },
      { name: 'trial_id', type: 'VARCHAR(20)', nullable: false, description: '시험 ID (FK)' },
      { name: 'subject_id', type: 'VARCHAR(20)', nullable: false, description: '참여자 ID (FK)' },
      { name: 'visit_number', type: 'INT', nullable: false, description: '방문 차수' },
      { name: 'outcome', type: 'TEXT', nullable: true, description: '결과' },
      { name: 'adverse_event', type: 'TEXT', nullable: true, description: '이상 반응' },
      { name: 'notes', type: 'TEXT', nullable: true, description: '비고' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
  {
    id: 7, db: '임상시험 DB (통합 DB)', name: 'trial_visits', description: '시험 방문 기록 테이블',
    recordCount: 12890, columnCount: 7, lastUpdated: '2024-01-15',
    columns: [
      { name: 'visit_id', type: 'VARCHAR(20)', nullable: false, description: '방문 고유 ID' },
      { name: 'subject_id', type: 'VARCHAR(20)', nullable: false, description: '참여자 ID (FK)' },
      { name: 'visit_date', type: 'DATE', nullable: false, description: '방문 날짜' },
      { name: 'visit_type', type: 'VARCHAR(50)', nullable: false, description: '방문 유형' },
      { name: 'start_time', type: 'DATETIME', nullable: true, description: '시작 시간' },
      { name: 'end_time', type: 'DATETIME', nullable: true, description: '종료 시간' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
  {
    id: 8, db: '임상시험 DB (통합 DB)', name: 'trial_measurements', description: '시험 측정 데이터 테이블',
    recordCount: 67890, columnCount: 9, lastUpdated: '2024-01-13',
    columns: [
      { name: 'measurement_id', type: 'VARCHAR(20)', nullable: false, description: '측정 고유 ID' },
      { name: 'subject_id', type: 'VARCHAR(20)', nullable: false, description: '참여자 ID (FK)' },
      { name: 'visit_id', type: 'VARCHAR(20)', nullable: false, description: '방문 ID (FK)' },
      { name: 'test_name', type: 'VARCHAR(200)', nullable: false, description: '검사명' },
      { name: 'test_code', type: 'VARCHAR(50)', nullable: false, description: '검사 코드' },
      { name: 'result_value', type: 'VARCHAR(100)', nullable: true, description: '결과값' },
      { name: 'unit', type: 'VARCHAR(50)', nullable: true, description: '단위' },
      { name: 'test_date', type: 'DATETIME', nullable: false, description: '검사 일시' },
      { name: 'created_at', type: 'DATETIME', nullable: false, description: '레코드 생성일' },
    ],
  },
]

const scores: [number, number][] = [
  [98.5, 94.5], [94.2, 89.2], [97.8, 93.8], [95.6, 91.6], [96.3, 92.3],
  [93.7, 88.7], [97.1, 94.1], [95.2, 90.2], [94.8, 89.8],
  [92.3, 87.3], [96.7, 93.7], [94.5, 89.5], [91.8, 86.8], [95.9, 91.9],
  [93.4, 88.4], [97.6, 94.6], [94.1, 89.1], [92.7, 87.7],
  [96.2, 92.2], [93.9, 88.9], [95.4, 90.4], [94.6, 89.6], [92.1, 87.1],
  [97.3, 93.3], [95.8, 91.8], [93.2, 88.2], [96.5, 92.5],
]

export const indicatorsData: Indicator[] = Array.from({ length: 27 }, (_, i) => {
  const categoryIndex = Math.floor(i / 9)
  return {
    id: i + 1,
    category: CATEGORIES[categoryIndex],
    name: `${CATEGORIES[categoryIndex]} 지표 ${(i % 9) + 1}`,
    description: `${CATEGORIES[categoryIndex]} 관련 품질 검증 지표입니다`,
    db1Score: scores[i][0],
    db2Score: scores[i][1],
    weight: 8 + (i % 3),
    threshold: 90 + (i % 6),
    lastModified: `2024-01-${15 - (i % 15)}`,
    appliedDate: `2024-01-${10 - (i % 10)}`,
    isActive: i % 5 !== 0,
  }
})
