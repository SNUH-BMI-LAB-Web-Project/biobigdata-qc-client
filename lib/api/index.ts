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

type Schema<K extends keyof components['schemas']> = Required<
  components['schemas'][K]
>

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
export type Stage = NonNullable<
  components['schemas']['DagRunRequest']['targetStage']
>
export type SubStage = NonNullable<
  components['schemas']['DagRunRequest']['targetSubStage']
>
export type VerificationScope = NonNullable<
  components['schemas']['DagRunRequest']['scope']
>
export type MetricLevel = NonNullable<
  components['schemas']['DagRunRequest']['metricLevel']
>
export type RunStatus = 0 | 1 | 2 | 3

export type LoginRequest = Schema<'LoginRequest'>
export type LoginResponse = Schema<'LoginResponse'>
export type MemberResponse = Schema<'MemberResponse'>
export type MemberUpdateRequest = Schema<'MemberUpdateRequest'>
export type SignupRequest = Schema<'SignupRequest'>
export type PasswordChangeRequest = Schema<'PasswordChangeRequest'>
export type AdminMemberCreateRequest = Schema<'AdminMemberCreateRequest'>
export type AdminMemberUpdateRequest = Schema<'AdminMemberUpdateRequest'>
export type RolePermissionsResponse = Schema<'RolePermissionsResponse'>
export type RolePermissionsUpdateRequest =
  Schema<'RolePermissionsUpdateRequest'>
export type DagRunRequest = components['schemas']['DagRunRequest']
export type DagRunResponse = Schema<'DagRunResponse'>
export type CreateDqTableRequest = components['schemas']['CreateDqTableRequest']
export type UpdateDqTableRequest = components['schemas']['UpdateDqTableRequest']
export type CreateDqFieldRequest = components['schemas']['CreateDqFieldRequest']
export type UpdateDqFieldRequest = components['schemas']['UpdateDqFieldRequest']
export type DqTableResponse = Schema<'DqTableResponse'>
export type DqFieldResponse = Schema<'DqFieldResponse'>
export type DqQualityMetricResponse = Schema<'DqQualityMetricResponse'>
export type DqQualityMetricDetailResponse =
  Schema<'DqQualityMetricDetailResponse'>
export type FieldCheckItem = Schema<'FieldCheckItem'>
export type CheckPickerItemResponse = Schema<'CheckPickerItemResponse'>
export type MetricPickerItemResponse = Schema<'MetricPickerItemResponse'>
export type DqStatisticsAnalysisResponse =
  Schema<'DqStatisticsAnalysisResponse'>
export type DqStatisticsMetricResponse = Schema<'DqStatisticsMetricResponse'>
export type DqRunLogResponse = Schema<'DqRunLogResponse'> & {
  runStatus: RunStatus
}
export type RunExecutionResponse = Schema<'RunExecutionResponse'> & {
  runStatus: RunStatus
}
export type RunExecutionDetailResponse =
  Schema<'RunExecutionDetailResponse'> & {
    runStatus: RunStatus
    score: number | null
  }
export type DqQualityResultSummaryResponse =
  Schema<'DqQualityResultSummaryResponse'>
export type DqQualityResultResponse = Schema<'DqQualityResultResponse'> & {
  passRate: number | null
}
export type DqMetricResultResponse = Schema<'DqMetricResultResponse'> & {
  passRate: number | null
}
export type DqSubMetricResultResponse = Schema<'DqSubMetricResultResponse'> & {
  passRate: number | null
}
export type DqStatisticsResultResponse = Schema<'DqStatisticsResultResponse'>
export type DqStatisticsResultDistResponse =
  Schema<'DqStatisticsResultDistResponse'>
export type DqStageResponse = Schema<'DqStageResponse'>

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: '관리자',
  MANAGER: '매니저',
  VIEWER: '뷰어',
}

export const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  0: '진행중',
  1: '완료',
  2: '오류',
  3: '중단',
}

export const runTypeLabel = (runType: string): string =>
  ({ quality: '품질지표', statistics: '통계지표' })[runType] ?? runType

export const STAGE_LABEL: Record<string, string> = {
  LINK: '연계DB',
  COLL: '수집DB',
  PREP: '전처리DB',
  INTG: '통합DB',
  OPEN: '개방DB',
}
