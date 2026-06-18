// Member API (회원 조회/수정/탈퇴/가입/비밀번호)
import { api } from './client'
import type {
  MemberResponse,
  MemberUpdateRequest,
  SignupRequest,
  PasswordChangeRequest,
} from './types'

export const memberApi = {
  /** PUT /api/members/me — 내 정보 수정 */
  updateMe: (body: MemberUpdateRequest) => api.put<MemberResponse>('/api/members/me', body),

  /** DELETE /api/members/me — 회원 탈퇴 */
  withdraw: () => api.delete<void>('/api/members/me'),

  /** POST /api/members/signup — 회원가입 신청 */
  signup: (body: SignupRequest) => api.post<void>('/api/members/signup', body),

  /** POST /api/members/me/password — 비밀번호 변경 */
  changePassword: (body: PasswordChangeRequest) =>
    api.post<void>('/api/members/me/password', body),

  /** GET /api/members/check-id — 회원ID 중복 체크 (사용 가능 200 / 중복 409) */
  checkId: (mberId: string) => api.get<void>('/api/members/check-id', { mberId }),
}
