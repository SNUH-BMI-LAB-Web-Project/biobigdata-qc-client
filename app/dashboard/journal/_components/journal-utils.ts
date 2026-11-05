// 백엔드 일시 형식: 'YYYY-MM-DD HH:mm:ss' ↔ <input type="datetime-local"> 형식: 'YYYY-MM-DDTHH:mm'
export const toInputDatetime = (v?: string) =>
  v ? v.replace(' ', 'T').slice(0, 16) : ''

export const fromInputDatetime = (v: string) =>
  v ? `${v.replace('T', ' ')}:00` : undefined

/** 빈 문자열은 보내지 않는다 (수정 시 서버에서 null 로 저장) */
export const blankToUndefined = (v: string) => v.trim() || undefined

/** 목록 표시용 — 초 단위는 생략 */
export const shortDatetime = (v?: string) => (v ? v.slice(0, 16) : '-')

// 수정유형은 서버가 자유 문자열로 받는다 — 자주 쓰는 값만 제안한다 (datalist)
export const ACTION_TYPE_SUGGESTIONS = ['데이터 수정', '규칙 수정', '기관 정정']

export const errMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback
