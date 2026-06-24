// 백엔드에 아직 없는(생성 OpenAPI 스키마에 미포함) 엔드포인트용 임시 호출.
// generatedApi는 스키마에 정의된 경로만 호출할 수 있어, 여기서는 프록시(/api/*)로 직접 fetch한다.
// 백엔드가 해당 엔드포인트를 제공하면 schema 재생성 후 generatedApi 호출로 교체할 것.
import { ApiError } from './generated/client'

export interface DqFieldCreateRequest {
  fieldName: string
  datatype: string
  isRequired: string // Y/N
  isPk: string // Y/N
  isFk: string // Y/N
  fkTableName?: string
  fkFieldName?: string
  isEnable: string // 생성 시 항상 Y
  fieldDescription?: string
  fieldDescriptionDetail?: string
}

export interface DqTableCreateRequest {
  tableName: string
  stage: string
  dataCategory?: string
  tableRequired: string // Y/R/R2/O
  tableDescription?: string
  isEnable: string // 생성 시 항상 Y
  fields: DqFieldCreateRequest[]
}

async function placeholderRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let payload: { success?: boolean; code?: string; message?: string; data?: T } | null = null
  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    // 비 JSON 응답
  }

  if (!res.ok || payload?.success === false) {
    throw new ApiError(
      payload?.message || '아직 백엔드 API가 준비되지 않았습니다.',
      res.status,
      payload?.code,
    )
  }
  return payload?.data as T
}

export const placeholderApi = {
  /** POST /api/qc/tables — 테이블+컬럼 생성 (백엔드 미구현) */
  createTable: (body: DqTableCreateRequest) => placeholderRequest<void>('POST', '/api/qc/tables', body),
  /** PATCH /api/qc/quality-metrics/{id}/active — 품질지표 활성/비활성 (백엔드 미구현) */
  setQualityMetricActive: (metricId: string, isActive: boolean) =>
    placeholderRequest<void>('PATCH', `/api/qc/quality-metrics/${metricId}/active`, {
      isActive: isActive ? 'Y' : 'N',
    }),
  /** PATCH /api/qc/statistics-metrics/{id}/active — 통계지표 활성/비활성 (백엔드 미구현) */
  setStatisticsMetricActive: (siId: string, isActive: boolean) =>
    placeholderRequest<void>('PATCH', `/api/qc/statistics-metrics/${siId}/active`, {
      isActive: isActive ? 'Y' : 'N',
    }),
}
