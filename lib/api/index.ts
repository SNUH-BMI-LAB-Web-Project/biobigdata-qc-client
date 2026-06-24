// OpenAPI generated API 진입점
export {
  API_BASE_URL,
  ApiError,
  generatedApi,
  unwrapGeneratedResponse,
  unwrapGeneratedResult,
} from './generated/client'

export type {
  paths as GeneratedApiPaths,
  components as GeneratedApiComponents,
  operations as GeneratedApiOperations,
} from './generated/client'

import type { components } from './generated/client'

type Schema<K extends keyof components['schemas']> = Required<components['schemas'][K]>

export interface PageResult<T> {
  items: T[]
  totalCount: number
  page: number
  size: number
  totalPages: number
}

export type Role = NonNullable<components['schemas']['LoginResponse']['role']>
export type Permission = NonNullable<
  components['schemas']['RolePermissionsResponse']['permissions']
>[number]
export type Stage = NonNullable<components['schemas']['DagRunRequest']['targetStage']>
export type SubStage = NonNullable<components['schemas']['DagRunRequest']['targetSubStage']>
export type CheckStatus = 0 | 1 | 2 | 3

export type LoginRequest = Schema<'LoginRequest'>
export type LoginResponse = Schema<'LoginResponse'>
export type MemberResponse = Schema<'MemberResponse'>
export type MemberUpdateRequest = Schema<'MemberUpdateRequest'>
export type SignupRequest = Schema<'SignupRequest'>
export type PasswordChangeRequest = Schema<'PasswordChangeRequest'>
export type AdminMemberCreateRequest = Schema<'AdminMemberCreateRequest'>
export type AdminMemberUpdateRequest = Schema<'AdminMemberUpdateRequest'>
export type RolePermissionsResponse = Schema<'RolePermissionsResponse'>
export type RolePermissionsUpdateRequest = Schema<'RolePermissionsUpdateRequest'>
export type DagRunRequest = components['schemas']['DagRunRequest']
export type DagRunResponse = Schema<'DagRunResponse'>
export type DqTableResponse = Schema<'DqTableResponse'>
export type DqFieldResponse = Schema<'DqFieldResponse'>
export type DqQualityMetricResponse = Schema<'DqQualityMetricResponse'>
export type DqQualityMetricDetailResponse = Schema<'DqQualityMetricDetailResponse'>
export type FieldCheckItem = Schema<'FieldCheckItem'>
export type DqStatisticsMetricResponse = Schema<'DqStatisticsMetricResponse'>
export type DqAchillesAnalysisResponse = Schema<'DqAchillesAnalysisResponse'>
export type DqCheckLogResponse = Schema<'DqCheckLogResponse'> & { checkStatus: CheckStatus }
export type CheckExecutionResponse = Schema<'CheckExecutionResponse'> & { checkStatus: CheckStatus }
export type CheckExecutionDetailResponse = Schema<'CheckExecutionDetailResponse'> & {
  checkStatus: CheckStatus
  score: number | null
}
export type DqQualityResultSummaryResponse = Schema<'DqQualityResultSummaryResponse'>
export type DqQualityResultResponse = Schema<'DqQualityResultResponse'> & {
  passRate: number | null
}
export type DqAchillesResultResponse = Schema<'DqAchillesResultResponse'>
export type DqAchillesResultDistResponse = Schema<'DqAchillesResultDistResponse'>

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: '관리자',
  MANAGER: '매니저',
  VIEWER: '뷰어',
}

export const CHECK_STATUS_LABEL: Record<CheckStatus, string> = {
  0: '진행중',
  1: '완료',
  2: '오류',
  3: '중단',
}

export const checkTypeLabel = (checkType: string): string =>
  ({ quality: '품질지표', achilles: '통계지표' }[checkType] ?? checkType)

export const STAGE_LABEL: Record<string, string> = {
  LINK: '연계DB',
  COLL: '수집DB',
  PREP: '전처리DB',
  INTG: '통합DB',
  OPEN: '개방DB',
}

export const SUB_STAGE_LABEL: Record<string, string> = {
  preview_open: '사전 개방',
  main_open: '본 개방',
  PREVIEW_OPEN: '사전 개방',
  MAIN_OPEN: '본 개방',
}
