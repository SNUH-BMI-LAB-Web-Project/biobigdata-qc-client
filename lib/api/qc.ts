// QC API (품질/통계 지표, 테이블/필드, 검증 실행/결과)
import { api, type PageResult } from './client'
import type {
  DagRunRequest,
  DagRunResponse,
  DqTableResponse,
  DqFieldResponse,
  DqQualityMetricResponse,
  DqQualityMetricDetailResponse,
  FieldCheckItem,
  DqStatisticsMetricResponse,
  DqAchillesAnalysisResponse,
  DqCheckLogResponse,
  CheckExecutionResponse,
  CheckExecutionDetailResponse,
  DqQualityResultSummaryResponse,
  DqQualityResultResponse,
  DqAchillesResultResponse,
  DqAchillesResultDistResponse,
} from './types'

interface Paging {
  page?: number
  size?: number
}

export const qcApi = {
  // ── 품질 지표 ────────────────────────────────────────────────
  /** GET /api/qc/quality-metrics — 품질 지표 목록 */
  getQualityMetrics: (
    params: Paging & { keyword?: string; category?: string } = {},
    signal?: AbortSignal,
  ) => api.get<PageResult<DqQualityMetricResponse>>('/api/qc/quality-metrics', { ...params }, signal),

  /** POST /api/qc/quality-metrics — 품질 지표 검증 DAG 실행 */
  runQualityDag: (body: DagRunRequest) =>
    api.post<DagRunResponse>('/api/qc/quality-metrics', body),

  /** GET /api/qc/quality-metrics/{metricId} — 품질 지표 상세 */
  getQualityMetricDetail: (metricId: string, signal?: AbortSignal) =>
    api.get<DqQualityMetricDetailResponse>(`/api/qc/quality-metrics/${metricId}`, undefined, signal),

  /** GET /api/qc/quality-metrics/{metricId}/checks — 적용 대상 컬럼 */
  getQualityMetricChecks: (
    metricId: string,
    params: Paging & { isActive?: string; tableName?: string; fieldName?: string } = {},
    signal?: AbortSignal,
  ) =>
    api.get<PageResult<FieldCheckItem>>(
      `/api/qc/quality-metrics/${metricId}/checks`,
      { ...params },
      signal,
    ),

  // ── 통계 지표 ────────────────────────────────────────────────
  /** GET /api/qc/statistics-metrics — 통계 지표 목록 */
  getStatisticsMetrics: (params: Paging = {}, signal?: AbortSignal) =>
    api.get<PageResult<DqStatisticsMetricResponse>>(
      '/api/qc/statistics-metrics',
      { ...params },
      signal,
    ),

  /** POST /api/qc/statistics-metrics — 통계 지표 검증 DAG 실행 */
  runStatisticsDag: (body: DagRunRequest) =>
    api.post<DagRunResponse>('/api/qc/statistics-metrics', body),

  /** GET /api/qc/statistics-metrics/{siId}/analyses — Achilles 분석 목록 */
  getAchillesAnalyses: (siId: string, params: Paging = {}, signal?: AbortSignal) =>
    api.get<PageResult<DqAchillesAnalysisResponse>>(
      `/api/qc/statistics-metrics/${siId}/analyses`,
      { ...params },
      signal,
    ),

  // ── 테이블 / 필드 ────────────────────────────────────────────
  /** GET /api/qc/tables — DQ 테이블 목록 */
  getTables: (
    params: Paging & { keyword?: string; dataCategory?: string; includeDisabled?: boolean } = {},
    signal?: AbortSignal,
  ) => api.get<PageResult<DqTableResponse>>('/api/qc/tables', { ...params }, signal),

  /** GET /api/qc/tables/{tableId}/fields — DQ 필드 목록 */
  getFields: (tableId: string, params: Paging = {}, signal?: AbortSignal) =>
    api.get<PageResult<DqFieldResponse>>(`/api/qc/tables/${tableId}/fields`, { ...params }, signal),

  // ── 검증 현황 ────────────────────────────────────────────────
  /** GET /api/qc/executions — 검증 현황 목록 */
  getExecutions: (params: Paging = {}, signal?: AbortSignal) =>
    api.get<PageResult<CheckExecutionResponse>>('/api/qc/executions', { ...params }, signal),

  /** GET /api/qc/executions/{checkId} — 검증 현황 상세 */
  getExecutionDetail: (checkId: number, signal?: AbortSignal) =>
    api.get<CheckExecutionDetailResponse[]>(`/api/qc/executions/${checkId}`, undefined, signal),

  // ── 품질 검증 결과 ───────────────────────────────────────────
  /** GET /api/qc/quality-results/summary — stage별 요약 */
  getQualityResultSummary: (signal?: AbortSignal) =>
    api.get<DqQualityResultSummaryResponse[]>('/api/qc/quality-results/summary', undefined, signal),

  /** GET /api/qc/quality-results/checks — 품질 검증 실행 내역 */
  getQualityCheckLogs: (params: Paging & { stage?: string } = {}, signal?: AbortSignal) =>
    api.get<PageResult<DqCheckLogResponse>>('/api/qc/quality-results/checks', { ...params }, signal),

  /** GET /api/qc/quality-results/checks/{checkId}/metrics — checkId별 지표 결과 */
  getQualityResultsByCheckId: (checkId: number, params: Paging = {}, signal?: AbortSignal) =>
    api.get<PageResult<DqQualityResultResponse>>(
      `/api/qc/quality-results/checks/${checkId}/metrics`,
      { ...params },
      signal,
    ),

  // ── 통계 검증 결과 ───────────────────────────────────────────
  /** GET /api/qc/statistics-results/checks — 통계 검증 실행 내역 */
  getStatisticsCheckLogs: (params: Paging & { stage?: string } = {}, signal?: AbortSignal) =>
    api.get<PageResult<DqCheckLogResponse>>(
      '/api/qc/statistics-results/checks',
      { ...params },
      signal,
    ),

  /** GET /api/qc/statistics-results/checks/{checkId}/analyses — 통계 결과(단순값) */
  getAchillesResults: (checkId: number, analysisId?: string, signal?: AbortSignal) =>
    api.get<DqAchillesResultResponse[]>(
      `/api/qc/statistics-results/checks/${checkId}/analyses`,
      { analysisId },
      signal,
    ),

  /** GET /api/qc/statistics-results/checks/{checkId}/analyses/dist — 통계 결과(분포) */
  getAchillesResultsDist: (checkId: number, analysisId?: string, signal?: AbortSignal) =>
    api.get<DqAchillesResultDistResponse[]>(
      `/api/qc/statistics-results/checks/${checkId}/analyses/dist`,
      { analysisId },
      signal,
    ),
}
