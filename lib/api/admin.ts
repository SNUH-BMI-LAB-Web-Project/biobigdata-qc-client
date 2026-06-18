// Admin API (사용자/권한 관리)
import { api, type PageResult } from './client'
import type {
  MemberResponse,
  AdminMemberCreateRequest,
  AdminMemberUpdateRequest,
  RolePermissionsResponse,
  RolePermissionsUpdateRequest,
  PasswordChangeRequest,
  Role,
} from './types'

interface MemberListParams {
  searchKeyword?: string
  status?: string // A:신청대기 / P:승인 / D:탈퇴
  page?: number
  size?: number
}

export const adminApi = {
  /** GET /api/admin/members — 사용자 목록 */
  getMembers: (params: MemberListParams = {}, signal?: AbortSignal) =>
    api.get<PageResult<MemberResponse>>('/api/admin/members', { ...params }, signal),

  /** POST /api/admin/members — 사용자 생성 */
  createMember: (body: AdminMemberCreateRequest) =>
    api.post<MemberResponse>('/api/admin/members', body),

  /** GET /api/admin/members/{esntlId} — 사용자 상세 */
  getMember: (esntlId: string, signal?: AbortSignal) =>
    api.get<MemberResponse>(`/api/admin/members/${esntlId}`, undefined, signal),

  /** PUT /api/admin/members/{esntlId} — 사용자 수정 */
  updateMember: (esntlId: string, body: AdminMemberUpdateRequest) =>
    api.put<MemberResponse>(`/api/admin/members/${esntlId}`, body),

  /** DELETE /api/admin/members/{esntlId} — 사용자 비활성화 */
  deleteMember: (esntlId: string) => api.delete<void>(`/api/admin/members/${esntlId}`),

  /** POST /api/admin/members/{esntlId}/password — 비밀번호 초기화 */
  resetMemberPassword: (esntlId: string) =>
    api.post<void>(`/api/admin/members/${esntlId}/password`),

  /** POST /api/admin/password — 관리자 비밀번호 변경 */
  changePassword: (body: PasswordChangeRequest) => api.post<void>('/api/admin/password', body),

  /** GET /api/admin/permissions/{role} — 역할별 권한 조회 */
  getPermissions: (role: Role, signal?: AbortSignal) =>
    api.get<RolePermissionsResponse>(`/api/admin/permissions/${role}`, undefined, signal),

  /** PUT /api/admin/permissions/{role} — 역할별 권한 수정 */
  updatePermissions: (role: Role, body: RolePermissionsUpdateRequest) =>
    api.put<void>(`/api/admin/permissions/${role}`, body),
}
