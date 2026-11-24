'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  AlertCircle,
  Download,
  Loader2,
  Play,
  RotateCcw,
  X,
} from 'lucide-react'
import { AsyncStateBlock, TableStateRow } from '@/components/async-state'
import { CompactPager } from '@/components/pager'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useApi } from '@/hooks/use-api'
import {
  API_BASE_URL,
  ApiError,
  generatedApi,
  unwrapGeneratedResult,
} from '@/lib/api'
import type {
  DqSubMetricResultResponse,
  PageResult,
  ViolationExecuteResponse,
  ViolationQueryInfoResponse,
  ViolationRowResponse,
} from '@/lib/api'

const PAGE_SIZE = 200 // 서버 첫 페이지 크기와 동일

// 오버레이/콘텐츠 공통 클래스 (account-dialog 와 동일 패턴)
const OVERLAY_CLASS =
  'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
const CONTENT_CLASS =
  'bg-background fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-lg border p-6 shadow-lg sm:max-w-3xl'

interface QueryError {
  title: string
  message: string
}

// crypto.randomUUID 는 HTTPS/localhost 에서만 동작 — 내부망 http 배포 대비 getRandomValues 사용
const newJobId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('')

/**
 * 실행 중 쿼리 종료 요청. 언마운트·탭 닫기(pagehide) 중에도 전송이 보장되도록 sendBeacon 사용
 * (같은 오리진 프록시라 세션 쿠키 포함).
 */
const sendAbort = (jobId: string) =>
  navigator.sendBeacon(
    `${API_BASE_URL}/api/qc/quality-results/violations/${jobId}/abort`,
  )

function formatDuration(ms: number) {
  if (ms < 1000) return '1초 미만'
  const sec = Math.round(ms / 1000)
  if (sec < 60) return `${sec}초`
  return `${Math.floor(sec / 60)}분 ${sec % 60}초`
}

function toQueryError(err: unknown): QueryError {
  if (!(err instanceof ApiError)) {
    return {
      title: '쿼리 실행 실패',
      message: '요청 처리 중 오류가 발생했습니다.',
    }
  }
  const title =
    err.status === 400
      ? '쿼리 형식 오류'
      : err.status === 404
        ? '조회 불가'
        : '쿼리 실행 실패'
  return { title, message: err.message }
}

/** 세부지표 1건의 위반 데이터(기관ID/참여자ID/오류 값) 상세. 닫히면(언마운트) 실행 중 쿼리를 종료한다. */
export function ViolationDetailDialog({
  runId,
  metricId,
  sub,
  onClose,
}: {
  runId: number
  metricId: string
  sub: DqSubMetricResultResponse
  onClose: () => void
}) {
  const checkId = sub.subMetricId

  const [running, setRunning] = useState(false)
  const [startedAt, setStartedAt] = useState(0)
  const [now, setNow] = useState(0)
  const [result, setResult] = useState<ViolationExecuteResponse | null>(null)
  const [aborted, setAborted] = useState(false)
  const [queryError, setQueryError] = useState<QueryError | null>(null)

  // 실행 전 정보: 저장된(원본) 쿼리 · 예상 소요 시간 (DATABANK 는 조회하지 않음)
  // 404(쿼리 없음)는 데이터 상태라 재시도해도 같은 결과 — 재시도 버튼을 숨기기 위해 구분한다.
  const [queryMissing, setQueryMissing] = useState(false)
  const info = useApi(
    async (signal) => {
      setQueryMissing(false)
      try {
        return await unwrapGeneratedResult<ViolationQueryInfoResponse>(
          await generatedApi.GET(
            '/api/qc/quality-results/{runId}/violations/query',
            {
              params: { path: { runId }, query: { metricId, checkId } },
              signal,
            },
          ),
        )
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) setQueryMissing(true)
        throw err
      }
    },
    [runId, metricId, checkId],
  )
  const originalQuery = info.data?.violationQuery ?? null

  // 편집 중 쿼리(null = 원본 그대로) / 마지막 성공 실행의 editedSql(CSV·표 기준)
  const [draft, setDraft] = useState<string | null>(null)
  const query = draft ?? originalQuery ?? ''
  const [executedSql, setExecutedSql] = useState<string | undefined>()

  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<PageResult<ViolationRowResponse> | null>(
    null,
  )
  const [pageLoading, setPageLoading] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)

  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [rawDownloading, setRawDownloading] = useState(false)
  const [rawError, setRawError] = useState<string | null>(null)

  const runningJobRef = useRef<string | null>(null)
  const requestRef = useRef<AbortController | null>(null)

  const run = useCallback(
    async (editedSql?: string) => {
      const jobId = newJobId()
      runningJobRef.current = jobId
      const controller = new AbortController()
      requestRef.current = controller
      const t = Date.now()
      setStartedAt(t)
      setNow(t)
      setRunning(true)
      setAborted(false)
      setQueryError(null)
      setResult(null)
      setRows(null)
      setPageError(null)
      setPage(1)

      try {
        const res = await unwrapGeneratedResult<ViolationExecuteResponse>(
          await generatedApi.POST(
            '/api/qc/quality-results/{runId}/violations',
            {
              params: { path: { runId } },
              body: { jobId, metricId, checkId, editedSql },
              signal: controller.signal,
            },
          ),
        )
        if (res.execStatus === 'ABORTED') {
          setAborted(true)
          return
        }
        setResult(res)
        setRows(res.page as PageResult<ViolationRowResponse>)
        setExecutedSql(editedSql)
      } catch (err) {
        if (controller.signal.aborted) return
        setQueryError(toQueryError(err))
      } finally {
        if (runningJobRef.current === jobId) {
          runningJobRef.current = null
          setRunning(false)
        }
      }
    },
    [runId, metricId, checkId],
  )

  // 닫기·라우트 이동(언마운트) / 탭 닫기·새로고침·브라우저 종료(pagehide) 시 실행 중 쿼리 종료.
  // 프로세스 강제 종료·네트워크 단절은 전송 불가 → 서버 query-timeout 이 최종 방어선.
  useEffect(() => {
    const abortRunning = () => {
      if (runningJobRef.current) sendAbort(runningJobRef.current)
    }
    window.addEventListener('pagehide', abortRunning)
    return () => {
      window.removeEventListener('pagehide', abortRunning)
      abortRunning()
      runningJobRef.current = null
      requestRef.current?.abort()
    }
  }, [])

  // 실행 중 경과 시간 갱신
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  const stop = () => {
    if (runningJobRef.current) sendAbort(runningJobRef.current)
  }

  const trimmed = query.trim()
  const edited = originalQuery !== null && trimmed !== originalQuery.trim()

  const runCurrent = () => {
    if (!trimmed) {
      setQueryError({ title: '쿼리 형식 오류', message: '쿼리를 입력하세요.' })
      return
    }
    void run(edited ? trimmed : undefined)
  }

  const resetQuery = () => {
    setDraft(null)
    void run()
  }

  const goPage = async (next: number) => {
    if (!result) return
    setPage(next)
    setPageError(null)
    if (next === 1) {
      setRows(result.page as PageResult<ViolationRowResponse>)
      return
    }
    setRows(null)
    setPageLoading(true)
    try {
      setRows(
        await unwrapGeneratedResult<PageResult<ViolationRowResponse>>(
          await generatedApi.GET('/api/qc/quality-results/violations/{jobId}', {
            params: {
              path: { jobId: result.jobId },
              query: { page: next, size: PAGE_SIZE },
            },
          }),
        ),
      )
    } catch (err) {
      setRows(null)
      setPageError(
        err instanceof ApiError ? err.message : '페이지 조회에 실패했습니다.',
      )
    } finally {
      setPageLoading(false)
    }
  }

  // ponytail: 전체 CSV를 메모리 blob으로 받음 — 수십만 행 넘으면 GET + <a href> 직접 다운로드로 전환
  const saveCsv = async (
    path: string,
    body: object,
    filename: string,
    setBusy: (v: boolean) => void,
    setError: (v: string | null) => void,
  ) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/qc/quality-results/${runId}/violations/${path}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      )
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message ?? 'CSV 다운로드에 실패했습니다.')
      }
      // 서버가 전송 도중 실패하면 연결이 끊겨 blob() 이 reject 된다 (잘린 파일 저장 방지)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(
        err instanceof Error && err.message !== 'Failed to fetch'
          ? err.message
          : '다운로드 중 연결이 끊겼습니다. 다시 시도해주세요.',
      )
    } finally {
      setBusy(false)
    }
  }

  const downloadCsv = () =>
    saveCsv(
      'export',
      { metricId, checkId, editedSql: executedSql },
      `violations_${runId}_${metricId}_${checkId}.csv`,
      setDownloading,
      setDownloadError,
    )

  // 서버가 sql_text_violate_raw 를 실행 — NULL 이면 404, 실행 실패면 502 + 메시지를 그대로 표시
  const downloadRawCsv = () =>
    saveCsv(
      'raw-export',
      { metricId, checkId },
      `violations_raw_${runId}_${metricId}_${checkId}.csv`,
      setRawDownloading,
      setRawError,
    )

  const elapsedMs = Math.max(0, now - startedAt)
  const items = rows?.items ?? []

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={OVERLAY_CLASS} />
        <DialogPrimitive.Content className={CONTENT_CLASS}>
          <div className="pr-6 gap-6 flex items-center">
            <div>
              <DialogPrimitive.Title className="flex items-center gap-2 text-lg font-semibold">
                <AlertCircle className="size-5 text-red-600" />
                {'위반 데이터 상세'}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs text-muted-foreground">
                {sub.subMetricName ?? '-'}
                {' · '}
                <span className="font-mono">{checkId}</span>
                {' · 위반 '}
                <span className="font-bold text-red-600">
                  {(
                    result?.totalViolatedRows ??
                    info.data?.totalViolatedRows ??
                    sub.numViolatedRows
                  )?.toLocaleString() ?? '-'}
                </span>
                {'건'}
              </DialogPrimitive.Description>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={rawDownloading}
              onClick={downloadRawCsv}
            >
              {rawDownloading ? <Loader2 className="animate-spin" /> : <Download />}
              {'위반 데이터 원본 추출'}
            </Button>
          </div>
          {rawError && (
            <p role="alert" className="text-xs text-red-600">
              {rawError}
            </p>
          )}

          {originalQuery === null ? (
            <AsyncStateBlock
              loading={info.loading}
              error={info.error}
              empty={false}
              emptyMessage=""
              loadingMessage="검증 쿼리를 불러오는 중..."
              onRetry={queryMissing ? undefined : info.refetch}
            />
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {'검증 쿼리'}
                  {edited && (
                    <span className="ml-2 text-orange-600">{'(수정됨)'}</span>
                  )}
                </span>
                <div className="flex gap-1">
                  {(edited || executedSql !== undefined) && (
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={running}
                      onClick={resetQuery}
                    >
                      <RotateCcw />
                      {'원래 쿼리로'}
                    </Button>
                  )}
                  <Button size="xs" disabled={running} onClick={runCurrent}>
                    <Play />
                    {'실행'}
                  </Button>
                </div>
              </div>
              <Textarea
                value={query}
                onChange={(e) => setDraft(e.target.value)}
                disabled={running}
                spellCheck={false}
                aria-invalid={queryError !== null}
                className="max-h-48 font-mono text-xs md:text-xs resize-none"
              />
              <p className="text-[11px] text-muted-foreground">
                {
                  'SELECT 단일문만 가능하며, 결과에 INSTITUTION_ID / PARTICIPANT_ID / VIOLATED_VALUE 컬럼이 있어야 합니다. 수정한 쿼리는 저장되지 않습니다.'
                }
              </p>
            </div>
          )}

          {queryError && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <p className="font-semibold">{queryError.title}</p>
              <pre className="mt-1 max-h-32 overflow-y-auto font-mono text-xs whitespace-pre-wrap">
                {queryError.message}
              </pre>
            </div>
          )}

          {running ? (
            <div className="flex flex-col items-center gap-2 rounded-md border py-10 text-sm">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <p>{'위반 데이터를 조회하고 있습니다...'}</p>
              <p className="text-xs text-muted-foreground">
                {`경과 ${formatDuration(elapsedMs)}`}
              </p>
              <Button variant="outline" size="sm" onClick={stop}>
                {'조회 중단'}
              </Button>
            </div>
          ) : aborted ? (
            <div className="flex flex-col items-center gap-2 rounded-md border py-10 text-sm text-muted-foreground">
              <p>{'조회가 중단되었습니다.'}</p>
              <Button variant="outline" size="sm" onClick={runCurrent}>
                {'다시 조회'}
              </Button>
            </div>
          ) : !result && !queryError ? (
            info.data && (
              <div className="flex flex-col items-center gap-1 rounded-md border py-10 text-sm">
                <p className="font-medium">
                  {info.data.estimatedMs != null
                    ? `예상 소요 시간 약 ${formatDuration(info.data.estimatedMs)}`
                    : '예상 소요 시간 정보가 없습니다.'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {
                    '검증 실행 당시 기준입니다. 쿼리를 확인한 뒤 [실행]을 누르세요.'
                  }
                </p>
              </div>
            )
          ) : (
            result && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {`조회 ${result.returnedRows.toLocaleString()}건`}
                    {result.capped &&
                      ` · 상위 ${result.returnedRows.toLocaleString()}건만 표시 (전체는 CSV)`}
                  </span>
                  <div className="flex items-center gap-2">
                    {edited && (
                      <span className="text-[11px] text-muted-foreground">
                        {'마지막으로 실행한 쿼리 기준'}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={downloading}
                      onClick={downloadCsv}
                    >
                      {downloading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Download />
                      )}
                      {'CSV 다운로드'}
                    </Button>
                  </div>
                </div>
                {downloadError && (
                  <p role="alert" className="text-xs text-red-600">
                    {downloadError}
                  </p>
                )}
                <div className="max-h-[45vh] overflow-y-auto rounded-md border">
                  <Table className="table-fixed w-full">
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="text-xs">{'기관ID'}</TableHead>
                        <TableHead className="text-xs">{'참여자ID'}</TableHead>
                        <TableHead className="text-xs">{'오류 값'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableStateRow
                          colSpan={3}
                          loading={pageLoading}
                          error={pageError}
                          empty={!pageLoading && !pageError}
                          emptyMessage="위반 데이터가 없습니다."
                          onRetry={() => void run(executedSql)}
                        />
                      ) : (
                        items.map((row) => (
                          <TableRow key={row.rowKey}>
                            <TableCell
                              className="truncate font-mono text-xs"
                              title={row.institutionId}
                            >
                              {row.institutionId ?? '-'}
                            </TableCell>
                            <TableCell
                              className="truncate font-mono text-xs"
                              title={row.participantId}
                            >
                              {row.participantId ?? '-'}
                            </TableCell>
                            <TableCell
                              className="truncate text-xs"
                              title={row.violatedValue ?? 'NULL'}
                            >
                              {row.violatedValue ?? (
                                <span className="rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-600">
                                  {'NULL'}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end">
                  <CompactPager
                    page={page}
                    totalPages={Math.ceil(result.returnedRows / PAGE_SIZE)}
                    onChange={(p) => void goPage(p)}
                  />
                </div>
              </div>
            )
          )}

          <DialogPrimitive.Close
            className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            aria-label="닫기"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
