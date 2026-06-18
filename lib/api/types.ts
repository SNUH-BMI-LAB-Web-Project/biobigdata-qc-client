// QC Server API 타입 정의 (Swagger: docs/api/swagger.json 기준)

export type Role = 'ADMIN' | 'MANAGER' | 'VIEWER'

export type Permission =
  | 'MEMBER_VIEW'
  | 'MEMBER_CREATE'
  | 'MEMBER_UPDATE'
  | 'MEMBER_DELETE'
  | 'DB_VIEW'
  | 'DB_CREATE'
  | 'DB_UPDATE'
  | 'DB_DELETE'
  | 'QC_RUN'
  | 'QC_VIEW'
  | 'QC_INDICATOR'

/** DB 단계 코드 */
export type Stage = 'LINK' | 'COLL' | 'PREP' | 'INTG' | 'OPEN'
/** 사전/본 개방 서브 단계 */
export type SubStage = 'preview_open' | 'main_open'

// ── Auth / Member ──────────────────────────────────────────────
export interface LoginRequest {
  mberId: string
  password: string
}

export interface LoginResponse {
  esntlId: string
  mberId: string
  mberNm: string
  mberEmailAdres: string
  aflcoNm: string
  role: Role
}

export interface MemberResponse {
  esntlId: string
  mberId: string
  mberNm: string
  mbtlnum: string
  mberEmailAdres: string
  aflcoNm: string
  role: Role
  mberSttus: string // P:활성, D:탈퇴
  sbscrbDe: string
  lastLoginAt: string
}

export interface MemberUpdateRequest {
  mberNm: string
  mbtlnum?: string
  mberEmailAdres?: string
  aflcoNm?: string
}

export interface SignupRequest {
  mberId: string
  password: string
  mberNm: string
  mberEmailAdres?: string
  aflcoNm?: string
  role: Role
}

export interface PasswordChangeRequest {
  oldPassword: string
  newPassword: string
}

// ── Admin ──────────────────────────────────────────────────────
export interface AdminMemberCreateRequest {
  mberId: string
  mberNm: string
  mberEmailAdres?: string
  aflcoNm?: string
  role: Role
}

export interface AdminMemberUpdateRequest {
  mberNm: string
  mberEmailAdres?: string
  aflcoNm?: string
  role: Role
  mberSttus: string // P | D
}

export interface RolePermissionsResponse {
  role: Role
  permissions: Permission[]
}

export interface RolePermissionsUpdateRequest {
  permissions: Permission[]
}

// ── QC: DAG 실행 ───────────────────────────────────────────────
export interface DagRunRequest {
  targetStage: Stage
  targetSubStage?: SubStage
}

export interface DagRunResponse {
  dagRunId: string
  targetStage: string
  state: string
  logicalDate: string
}

// ── QC: 테이블/필드 ────────────────────────────────────────────
export interface DqTableResponse {
  tableId: string
  tableName: string
  stage: string
  dataCategory: string
  tableRequired: string
  tableDescription: string
  isEnable: string
}

export interface DqFieldResponse {
  fieldId: string
  fieldName: string
  fieldDescription: string
  fieldDescriptionDetail: string
  datatype: string
  isRequired: string
  isPk: string
  isFk: string
  fkTableName: string
  fkFieldName: string
  isEnable: string
}

// ── QC: 품질 지표 ──────────────────────────────────────────────
export interface DqQualityMetricResponse {
  isActive: string
  metricId: string
  category: string
  metricLevel: string // TABLE/FIELD/CONCEPT
  metricNameKor: string
  tableNames: string[]
  stageScores: Record<string, number> // { STAGE: 통과율% }
  createdAt: string
}

export interface DqQualityMetricDetailResponse {
  metricId: string
  metricNameKor: string
  category: string
  metricLevel: string
  createdAt: string
  isActive: string
  metricDescription: string
  stageScores: Record<string, number>
}

export interface FieldCheckItem {
  isActive: string
  dbName: string
  tableName: string
  fieldName: string
  createdAt: string
}

// ── QC: 통계 지표 ──────────────────────────────────────────────
export interface DqStatisticsMetricResponse {
  siId: string
  siName: string
  siDescription: string
  siStage: string
  siMetric: string // SCALE/DIST/FLOW/JOIN/TREND
  analysisId: string
  distribution: string // 0: count, 1: 분포
  isActive: string
  createdAt: string
  others: string
}

export interface DqAchillesAnalysisResponse {
  analysisId: string
  dataCategory: string
  analysisName: string
  analysisDescription: string
  isDefault: string
  distribution: string
  isActive: string
  others: string
  sqlText: string
}

// ── QC: 검증 실행 내역 / 결과 ──────────────────────────────────
/** check_status: 0 진행중 / 1 완료 / 2 오류 / 3 중단 */
export type CheckStatus = 0 | 1 | 2 | 3

export interface DqCheckLogResponse {
  checkId: number
  stage: string
  subStage: string
  checkType: string // quality / achilles
  checkStartDatetime: string
  checkEndDatetime: string
  checkStatus: CheckStatus
  checkStatusFstWrt: string // 실행 계정
}

export interface CheckExecutionResponse {
  checkId: number
  stage: string
  subStage: string
  checkType: string
  checkStatusFstWrt: string
  checkStartDatetime: string
  checkEndDatetime: string
  checkStatus: CheckStatus
}

export interface CheckExecutionDetailResponse {
  stage: string
  queryCount: number
  checkStartDatetime: string
  checkEndDatetime: string
  checkStatus: CheckStatus
  score: number | null
}

export interface DqQualityResultSummaryResponse {
  stage: string
  score: number
  metricCount: number
}

export interface DqQualityResultResponse {
  metricId: string
  metricNameKor: string
  metricName: string
  category: string
  stage: string
  metricLevel: string
  notApplicable: number // 0 성공 / 1 실패
  notApplicableReason: string
  numDenominatorRows: number
  numPassedRows: number
  numViolatedRows: number
  pctViolatedRows: number
  passRate: number
}

export interface DqAchillesResultResponse {
  analysisId: string
  stratum1Name: string
  stratum2Name: string
  stratum3Name: string
  stratum4Name: string
  stratum5Name: string
  countValue: number
  analysisStartDatetime: string
  analysisEndDatetime: string
}

export interface DqAchillesResultDistResponse {
  analysisId: string
  stratum1Name: string
  stratum2Name: string
  stratum3Name: string
  stratum4Name: string
  stratum5Name: string
  countValue: number
  minValue: number
  maxValue: number
  avgValue: number
  stdevValue: number
  medianValue: number
  p10Value: number
  p25Value: number
  p75Value: number
  p90Value: number
  analysisStartDatetime: string
  analysisEndDatetime: string
}

// ── 공통 헬퍼 ──────────────────────────────────────────────────
/** check_status 코드 → 한글 라벨 */
export const CHECK_STATUS_LABEL: Record<CheckStatus, string> = {
  0: '진행중',
  1: '완료',
  2: '오류',
  3: '중단',
}

/** stage 코드 → 한글 DB명 */
export const STAGE_LABEL: Record<string, string> = {
  LINK: '연계DB',
  COLL: '수집DB',
  PREP: '전처리DB',
  INTG: '통합DB',
  OPEN: '개방DB',
}

/** subStage 코드 → 한글 라벨 (대/소문자 모두 허용) */
export const SUB_STAGE_LABEL: Record<string, string> = {
  preview_open: '사전 개방',
  main_open: '본 개방',
  PREVIEW_OPEN: '사전 개방',
  MAIN_OPEN: '본 개방',
}
