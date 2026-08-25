'use client'

import { useMemo, useRef, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Loader2, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useApi } from '@/hooks/use-api'
import { ApiError, generatedApi, unwrapGeneratedResult } from '@/lib/api'
import type {
  CreateDqTableRequest,
  DqFieldResponse,
  DqTableResponse,
  PageResult,
  Stage,
} from '@/lib/api'
import { OVERLAY_CLASS } from '@/components/confirm-dialog'

const STAGE_OPTIONS: { value: Stage; label: string }[] = [
  { value: 'LINK', label: '연계' },
  { value: 'PREP', label: '전처리' },
  { value: 'INTG', label: '통합' },
  { value: 'OPEN', label: '개방' },
]

// 백엔드에서 null 불가 — 스키마 enum 값 중 하나를 선택해 전송한다.
// (satisfies로 백엔드 enum과 불일치 시 컴파일 에러가 나도록 고정)
type DataCategory = NonNullable<CreateDqTableRequest['dataCategory']>
const DATA_CATEGORY_OPTIONS = [
  '1차생성_모집관리(RCM)',
  '1차생성_문검진(HEALTH)',
  '1차생성_문검진(RCM)',
  '1차생성_희귀질환(eCRF)',
  '1차생성_기초임상(KR-CDI)',
  '1차생성_기초임상(CDM)',
  '2차연계_의무기록(PHR)',
  '2차연계_공공데이터',
  '2차연계_PGHD',
] as const satisfies readonly DataCategory[]

const REQUIRED_OPTIONS = [
  { value: 'Y', label: 'Y (필수)' },
  { value: 'R', label: 'R (필수)' },
  { value: 'R2', label: 'R2 (조건부필수)' },
  { value: 'O', label: 'O (선택)' },
]

const TIBERO_TYPES = [
  'VARCHAR2',
  'NVARCHAR2',
  'CHAR',
  'NCHAR',
  'NUMBER',
  'INTEGER',
  'FLOAT',
  'DATE',
  'TIMESTAMP',
  'CLOB',
  'NCLOB',
  'BLOB',
  'RAW',
] as const
type TiberoType = (typeof TIBERO_TYPES)[number]

interface ColumnDraft {
  key: string
  /** 기존 컬럼이면 존재, 새로 추가한 컬럼이면 undefined */
  fieldId?: string
  fieldName: string
  datatype: TiberoType
  isRequired: 'Y' | 'N'
  isPk: 'Y' | 'N'
  isFk: 'Y' | 'N'
  fkTableId: string
  fkTableName: string
  fkFieldName: string
  fieldDescription: string
  fieldDescriptionDetail: string
}

const newColumn = (key: string): ColumnDraft => ({
  key,
  fieldName: '',
  datatype: 'VARCHAR2',
  isRequired: 'N',
  isPk: 'N',
  isFk: 'N',
  fkTableId: '',
  fkTableName: '',
  fkFieldName: '',
  fieldDescription: '',
  fieldDescriptionDetail: '',
})

const yn = (value: string | undefined): 'Y' | 'N' =>
  value === 'Y' || value === 'y' ? 'Y' : 'N'

const fieldToColumn = (field: DqFieldResponse): ColumnDraft => ({
  key: field.fieldId,
  fieldId: field.fieldId,
  fieldName: field.fieldName ?? '',
  datatype: (TIBERO_TYPES as readonly string[]).includes(field.datatype)
    ? (field.datatype as TiberoType)
    : 'VARCHAR2',
  isRequired: yn(field.isRequired),
  isPk: yn(field.isPk),
  isFk: yn(field.isFk),
  fkTableId: '', // fkTableName 으로 참조 테이블 목록에서 렌더 시 역매칭한다
  fkTableName: field.fkTableName ?? '',
  fkFieldName: field.fkFieldName ?? '',
  fieldDescription: field.fieldDescription ?? '',
  fieldDescriptionDetail: field.fieldDescriptionDetail ?? '',
})

/** 변경 감지용 직렬화 — key/fkTableId 는 화면 전용이라 제외한다 */
const columnSignature = (c: ColumnDraft) =>
  JSON.stringify([
    c.fieldId ?? '',
    c.fieldName.trim(),
    c.datatype,
    c.isRequired,
    c.isPk,
    c.isFk,
    c.isFk === 'Y' ? c.fkTableName : '',
    c.isFk === 'Y' ? c.fkFieldName : '',
    c.fieldDescription.trim(),
    c.fieldDescriptionDetail.trim(),
  ])

function RequiredMark() {
  return <span className="text-destructive ml-0.5">{'*'}</span>
}

export function TableFormDialog({
  open,
  onOpenChange,
  table,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 있으면 수정 모드, 없으면 생성 모드 */
  table?: DqTableResponse | null
  onSaved: () => void
}) {
  const isEdit = !!table
  const keyCounter = useRef(0)
  const nextKey = () => `col-${keyCounter.current++}`

  // 초기값은 props 에서 직접 읽는다 — 부모가 대상이 바뀔 때 key 로 remount 시킨다
  const [tableName, setTableName] = useState(table?.tableName ?? '')
  const [stage, setStage] = useState<Stage | ''>((table?.stage as Stage) ?? '')
  const [dataCategory, setDataCategory] = useState(table?.dataCategory ?? '')
  const [tableRequired, setTableRequired] = useState(
    table?.tableRequired ?? '',
  )
  const [tableDescription, setTableDescription] = useState(
    table?.tableDescription ?? '',
  )
  const [columns, setColumns] = useState<ColumnDraft[]>([])
  const [removedFieldIds, setRemovedFieldIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 수정 모드: 열릴 때 기존 컬럼을 불러온다
  const fieldsApi = useApi(
    async (signal) =>
      open && table?.tableId
        ? unwrapGeneratedResult<PageResult<DqFieldResponse>>(
            await generatedApi.GET('/api/qc/tables/{tableId}/fields', {
              params: {
                path: { tableId: table.tableId },
                query: { page: 1, size: 500 },
              },
              signal,
            }),
          )
        : null,
    [open, table?.tableId],
  )

  // 조회가 끝나기 전에는 직전 요청의 data 가 남아 있으므로 loading 을 함께 본다
  const fieldItems = fieldsApi.loading ? null : (fieldsApi.data?.items ?? null)

  // 기존 컬럼 seed — 렌더 중 상태 조정 (effect 없이 즉시 재렌더된다)
  const [seeded, setSeeded] = useState(!isEdit)
  if (!seeded && fieldItems) {
    setSeeded(true)
    setColumns(fieldItems.map(fieldToColumn))
  }

  // FK 참조 테이블 후보 — FK 컬럼이 있을 때만 한 번 조회
  const anyFk = columns.some((c) => c.isFk === 'Y')
  const fkTablesApi = useApi(
    async (signal) =>
      anyFk
        ? unwrapGeneratedResult<PageResult<DqTableResponse>>(
            await generatedApi.GET('/api/qc/tables', {
              params: { query: { page: 1, size: 500, includeDisabled: true } },
              signal,
            }),
          )
        : null,
    [anyFk],
  )
  const fkTables = fkTablesApi.data?.items ?? []

  // 기존 FK 컬럼은 fkTableName 만 알고 있다 — 참조 컬럼 목록 조회에 필요한
  // fkTableId 를 목록에서 역매칭해 렌더 시점에 채운다 (상태로 들고 있지 않는다)
  const withFkTableId = (c: ColumnDraft): ColumnDraft =>
    c.isFk === 'Y' && !c.fkTableId && c.fkTableName
      ? {
          ...c,
          fkTableId:
            fkTables.find((t) => t.tableName === c.fkTableName)?.tableId ?? '',
        }
      : c

  // 열었을 때의 상태 — 변경 여부 판정 및 불필요한 필드 UPDATE 회피에 쓴다
  const originalSignature = useMemo(() => {
    if (!open) return ''
    const fields = table?.tableId ? fieldItems : []
    if (fields === null) return null // 아직 로딩 중 — 판정 보류
    return JSON.stringify([
      table?.tableName ?? '',
      table?.stage ?? '',
      table?.dataCategory ?? '',
      table?.tableRequired ?? '',
      table?.tableDescription ?? '',
      fields.map((f) => columnSignature(fieldToColumn(f))),
    ])
  }, [open, table, fieldItems])

  const currentSignature = JSON.stringify([
    tableName,
    stage,
    dataCategory,
    tableRequired,
    tableDescription,
    columns.map(columnSignature),
  ])

  const originalColumnSignatures = useMemo(() => {
    const map = new Map<string, string>()
    for (const f of fieldItems ?? []) {
      if (f.fieldId) map.set(f.fieldId, columnSignature(fieldToColumn(f)))
    }
    return map
  }, [fieldItems])

  const dirty =
    originalSignature !== null && currentSignature !== originalSignature

  const reset = () => {
    setTableName('')
    setStage('')
    setDataCategory('')
    setTableRequired('')
    setTableDescription('')
    setColumns([])
    setRemovedFieldIds([])
    setError(null)
  }

  const requestClose = (next: boolean) => {
    if (next) {
      onOpenChange(true)
      return
    }
    if (submitting) return
    if (
      dirty &&
      !window.confirm('작성 중인 내용이 사라집니다. 닫으시겠습니까?')
    )
      return
    reset()
    onOpenChange(false)
  }

  const patchColumn = (key: string, patch: Partial<ColumnDraft>) =>
    setColumns((cols) =>
      cols.map((c) => (c.key === key ? { ...c, ...patch } : c)),
    )

  const removeColumn = (col: ColumnDraft) => {
    if (col.fieldId) setRemovedFieldIds((ids) => [...ids, col.fieldId!])
    setColumns((cols) => cols.filter((x) => x.key !== col.key))
  }

  const duplicateNames = useMemo(() => {
    const seen = new Map<string, number>()
    columns.forEach((c) => {
      const n = c.fieldName.trim().toLowerCase()
      if (n) seen.set(n, (seen.get(n) ?? 0) + 1)
    })
    return new Set([...seen.entries()].filter(([, n]) => n > 1).map(([n]) => n))
  }, [columns])

  const validate = (): string | null => {
    if (!tableName.trim()) return '테이블명을 입력하세요.'
    if (!stage) return '단계를 선택하세요.'
    if (!dataCategory) return '데이터 카테고리를 선택하세요.'
    if (!tableRequired) return '필수여부를 선택하세요.'
    for (const c of columns) {
      if (!c.fieldName.trim()) return '컬럼명을 입력하세요.'
      if (c.isFk === 'Y' && (!c.fkTableName || !c.fkFieldName))
        return `FK 컬럼(${c.fieldName})의 참조 테이블/컬럼을 선택하세요.`
    }
    if (duplicateNames.size > 0) return '컬럼명이 중복되었습니다.'
    return null
  }

  const fieldBody = (c: ColumnDraft) => ({
    fieldName: c.fieldName.trim(),
    datatype: c.datatype,
    isRequired: c.isRequired,
    isPk: c.isPk,
    isFk: c.isFk,
    fkTableName: c.isFk === 'Y' ? c.fkTableName : undefined,
    fkFieldName: c.isFk === 'Y' ? c.fkFieldName : undefined,
    fieldDescription: c.fieldDescription.trim() || undefined,
    fieldDescriptionDetail: c.fieldDescriptionDetail.trim() || undefined,
  })

  const handleSubmit = async () => {
    const msg = validate()
    if (msg) {
      setError(msg)
      return
    }
    setError(null)
    setSubmitting(true)

    const tableBody = {
      tableName: tableName.trim(),
      stage: stage as 'LINK' | 'PREP' | 'INTG' | 'OPEN',
      dataCategory: dataCategory as DataCategory,
      tableRequired: tableRequired as 'Y' | 'R' | 'R2' | 'O',
      tableDescription: tableDescription.trim() || undefined,
    }

    try {
      if (isEdit) {
        const tableId = table!.tableId
        await unwrapGeneratedResult(
          await generatedApi.PUT('/api/qc/tables/{tableId}', {
            params: { path: { tableId } },
            body: tableBody,
          }),
        )
        // 삭제를 먼저 처리해야 지운 컬럼의 이름을 다른 컬럼이 넘겨받을 수 있다
        for (const fieldId of removedFieldIds) {
          await unwrapGeneratedResult(
            await generatedApi.DELETE(
              '/api/qc/tables/{tableId}/fields/{fieldId}',
              { params: { path: { tableId, fieldId } } },
            ),
          )
        }
        for (const c of columns) {
          if (c.fieldId) {
            // 값이 그대로면 UPDATE 를 보내지 않는다
            if (originalColumnSignatures.get(c.fieldId) === columnSignature(c))
              continue
            await unwrapGeneratedResult(
              await generatedApi.PUT(
                '/api/qc/tables/{tableId}/fields/{fieldId}',
                {
                  params: { path: { tableId, fieldId: c.fieldId } },
                  body: fieldBody(c),
                },
              ),
            )
          } else {
            await unwrapGeneratedResult(
              await generatedApi.POST('/api/qc/tables/{tableId}/fields', {
                params: { path: { tableId } },
                body: fieldBody(c),
              }),
            )
          }
        }
        alert('테이블이 수정되었습니다.')
      } else {
        const created = await unwrapGeneratedResult<DqTableResponse>(
          await generatedApi.POST('/api/qc/tables', { body: tableBody }),
        )
        const tableId = created.tableId!
        for (const c of columns) {
          await unwrapGeneratedResult(
            await generatedApi.POST('/api/qc/tables/{tableId}/fields', {
              params: { path: { tableId } },
              body: fieldBody(c),
            }),
          )
        }
        alert('테이블이 추가되었습니다.')
      }
      reset()
      onOpenChange(false)
      onSaved()
    } catch (err) {
      const base = err instanceof ApiError ? err.message : null
      if (isEdit) {
        // 순차 호출이라 앞선 변경은 이미 반영됐을 수 있다
        setError(
          `${base ?? '테이블 수정에 실패했습니다.'} (일부 변경만 반영되었을 수 있습니다.)`,
        )
        onSaved()
      } else {
        setError(base ?? '테이블 추가에 실패했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const submitLabel = isEdit ? '테이블 수정' : '테이블 추가'
  const loadingFields = isEdit && fieldsApi.isInitialLoading

  return (
    <DialogPrimitive.Root open={open} onOpenChange={requestClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={OVERLAY_CLASS} />
        <DialogPrimitive.Content className="bg-background fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border shadow-lg sm:max-w-4xl">
          <div className="px-6 pt-6 pb-4">
            <DialogPrimitive.Title className="text-lg font-semibold">
              {submitLabel}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {isEdit
                ? '원천 테이블과 컬럼을 수정합니다.'
                : '원천 테이블과 컬럼을 생성합니다.'}
            </DialogPrimitive.Description>
            <DialogPrimitive.Close
              className="absolute top-4 right-4 opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>
          </div>

          {/* 본문 (스크롤) */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* 테이블 기본 정보 */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  테이블명
                  <RequiredMark />
                </Label>
                <Input
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="예: BIKO_INFO_PATIENT"
                  className="h-9 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    단계
                    <RequiredMark />
                  </Label>
                  <Select
                    value={stage || undefined}
                    onValueChange={(v) => setStage(v as Stage)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="단계 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGE_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    필수여부
                    <RequiredMark />
                  </Label>
                  <Select
                    value={tableRequired || undefined}
                    onValueChange={setTableRequired}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="필수여부 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {REQUIRED_OPTIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  데이터 카테고리
                  <RequiredMark />
                </Label>
                <Select
                  value={dataCategory || undefined}
                  onValueChange={setDataCategory}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="데이터 카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">설명 (선택)</Label>
                <textarea
                  value={tableDescription}
                  onChange={(e) => setTableDescription(e.target.value)}
                  placeholder="테이블 설명"
                  className="border-input min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>
            </div>

            {/* 컬럼 목록 */}
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  컬럼 ({columns.length}개)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={() =>
                    setColumns((c) => [...c, newColumn(nextKey())])
                  }
                >
                  <Plus className="w-3.5 h-3.5" />
                  컬럼 추가
                </Button>
              </div>

              {loadingFields ? (
                <p className="text-xs text-muted-foreground py-4 text-center border rounded-md">
                  <Loader2 className="w-4 h-4 mx-auto animate-spin" />
                </p>
              ) : columns.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center border rounded-md">
                  컬럼을 추가하세요.
                </p>
              ) : (
                <div className="space-y-3">
                  {columns.map((col, idx) => {
                    const isDup =
                      !!col.fieldName.trim() &&
                      duplicateNames.has(col.fieldName.trim().toLowerCase())
                    return (
                      <div
                        key={col.key}
                        className="p-3 rounded-md border space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            #컬럼{idx + 1}
                            {col.fieldId && (
                              <span className="ml-1.5 font-mono">
                                ({col.fieldId})
                              </span>
                            )}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive"
                            onClick={() => removeColumn(col)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        {/* 컬럼명 */}
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">
                            컬럼명
                            <RequiredMark />
                          </Label>
                          <Input
                            value={col.fieldName}
                            onChange={(e) =>
                              patchColumn(col.key, {
                                fieldName: e.target.value,
                              })
                            }
                            className={`h-8 text-xs font-mono ${isDup ? 'border-destructive' : ''}`}
                          />
                          {isDup && (
                            <p className="text-[10px] text-destructive">
                              중복된 컬럼명
                            </p>
                          )}
                        </div>

                        {/* 타입 / 필수 / PK / FK */}
                        <div className="grid grid-cols-4 gap-2">
                          <ColumnSelect
                            label="타입"
                            value={col.datatype}
                            onChange={(v) =>
                              patchColumn(col.key, {
                                datatype: v as TiberoType,
                              })
                            }
                            options={TIBERO_TYPES.map((t) => ({
                              value: t,
                              label: t,
                            }))}
                            mono
                          />
                          <ColumnSelect
                            label="필수"
                            value={col.isRequired}
                            onChange={(v) =>
                              patchColumn(col.key, {
                                isRequired: v as 'Y' | 'N',
                              })
                            }
                            options={[
                              { value: 'Y', label: 'Y' },
                              { value: 'N', label: 'N' },
                            ]}
                          />
                          <ColumnSelect
                            label="PK"
                            value={col.isPk}
                            onChange={(v) =>
                              patchColumn(col.key, { isPk: v as 'Y' | 'N' })
                            }
                            options={[
                              { value: 'Y', label: 'Y' },
                              { value: 'N', label: 'None' },
                            ]}
                          />
                          <ColumnSelect
                            label="FK"
                            value={col.isFk}
                            onChange={(v) =>
                              patchColumn(col.key, {
                                isFk: v as 'Y' | 'N',
                                ...(v === 'N'
                                  ? {
                                      fkTableId: '',
                                      fkTableName: '',
                                      fkFieldName: '',
                                    }
                                  : {}),
                              })
                            }
                            options={[
                              { value: 'Y', label: 'Y' },
                              { value: 'N', label: 'N' },
                            ]}
                          />
                        </div>

                        {col.isFk === 'Y' && (
                          <FkReferencePicker
                            column={withFkTableId(col)}
                            tables={fkTables}
                            tablesLoading={fkTablesApi.loading}
                            onChange={(patch) => patchColumn(col.key, patch)}
                          />
                        )}

                        {/* 설명 / 상세설명 */}
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">
                            설명 (선택)
                          </Label>
                          <Input
                            value={col.fieldDescription}
                            onChange={(e) =>
                              patchColumn(col.key, {
                                fieldDescription: e.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">
                            상세설명 (선택)
                          </Label>
                          <Input
                            value={col.fieldDescriptionDetail}
                            onChange={(e) =>
                              patchColumn(col.key, {
                                fieldDescriptionDetail: e.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* 푸터 */}
          <div className="px-6 py-4 flex justify-end">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || loadingFields}
              className="gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function ColumnSelect({
  label,
  value,
  onChange,
  options,
  mono,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  mono?: boolean
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`h-8 text-xs ${mono ? 'font-mono' : ''}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem
              key={o.value}
              value={o.value}
              className={`text-xs ${mono ? 'font-mono' : ''}`}
            >
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// FK 참조: 참조 테이블 선택 → 그 테이블의 컬럼 선택
function FkReferencePicker({
  column,
  tables,
  tablesLoading,
  onChange,
}: {
  column: ColumnDraft
  tables: DqTableResponse[]
  tablesLoading: boolean
  onChange: (patch: Partial<ColumnDraft>) => void
}) {
  const fieldsApi = useApi(
    async (signal) =>
      column.fkTableId
        ? unwrapGeneratedResult<PageResult<DqFieldResponse>>(
            await generatedApi.GET('/api/qc/tables/{tableId}/fields', {
              params: {
                path: { tableId: column.fkTableId },
                query: { page: 1, size: 500 },
              },
              signal,
            }),
          )
        : null,
    [column.fkTableId],
  )
  const fields = fieldsApi.data?.items ?? []

  return (
    <div className="grid grid-cols-2 gap-2 mt-1 p-2 rounded-md bg-muted/40">
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">참조 테이블</Label>
        <Select
          value={column.fkTableId || undefined}
          onValueChange={(tableId) => {
            const t = tables.find((x) => x.tableId === tableId)
            onChange({
              fkTableId: tableId,
              fkTableName: t?.tableName ?? '',
              fkFieldName: '',
            })
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue
              placeholder={tablesLoading ? '불러오는 중...' : '테이블 선택'}
            />
          </SelectTrigger>
          <SelectContent>
            {tables.map((t) => (
              <SelectItem key={t.tableId} value={t.tableId} className="text-xs">
                {t.tableName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">
          참조 컬럼(외래키)
        </Label>
        <Select
          value={column.fkFieldName || undefined}
          onValueChange={(fieldName) => onChange({ fkFieldName: fieldName })}
          disabled={!column.fkTableId || fieldsApi.loading}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue
              placeholder={
                !column.fkTableId
                  ? '먼저 테이블 선택'
                  : fieldsApi.loading
                    ? '불러오는 중...'
                    : '컬럼 선택'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {fields.map((f) => (
              <SelectItem
                key={f.fieldId}
                value={f.fieldName}
                className="text-xs"
              >
                {f.fieldName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
