'use client'

import { useApi } from '@/hooks/use-api'
import {
  generatedApi,
  STAGE_LABEL,
  unwrapGeneratedResult,
  type DqStageResponse,
} from '@/lib/api'

/** DB 단계 하나와 그 단계에 등록된 개방 버전들. */
export interface StageGroup {
  stage: string
  label: string
  versions: DqStageResponse[]
}

/**
 * QC_SCHEMA.dq_stage 의 개방 버전 조회.
 * 관리자가 /admin/stages 에서 등록한 값이 곧 검증 대상 선택지가 된다.
 *
 * @param enabledOnly 사용중인 버전만. 실행 이력처럼 과거 버전을 가리킬 수 있는 화면은 false.
 */
export function useStages(enabledOnly: boolean) {
  const { data, isInitialLoading, error } = useApi(
    async (signal) =>
      unwrapGeneratedResult<DqStageResponse[]>(
        await generatedApi.GET('/api/qc/stages', {
          params: { query: { enabledOnly } },
          signal,
        }),
      ),
    [enabledOnly],
  )

  const stages = data ?? []

  // 서버가 STAGE, SUB_STAGE 순으로 정렬해 주므로 등장 순서를 그대로 유지한다.
  const groups: StageGroup[] = []
  for (const version of stages) {
    const stage = version.stage
    let group = groups.find((g) => g.stage === stage)
    if (!group) {
      group = { stage, label: STAGE_LABEL[stage] ?? stage, versions: [] }
      groups.push(group)
    }
    group.versions.push(version)
  }

  // 연계DB는 구조상 dq_stage에 등록 행이 없어 서버 응답만으로는 선택지에서 빠진다 —
  // 항상 노출하고 버전 없이(=세부 단계 선택 건너뛰고) 바로 지표 유형을 고르게 한다.
  if (!groups.some((g) => g.stage === 'LINK')) {
    groups.unshift({ stage: 'LINK', label: STAGE_LABEL.LINK, versions: [] })
  }

  return { stages, groups, loading: isInitialLoading, error }
}

/**
 * 실행 이력 등에 저장된 subStage 값을 사람이 읽을 이름으로 바꾼다.
 * dq_run_logs.SUB_STAGE 에는 dq_stage.SUB_STAGE 와 같은 값이 들어온다.
 */
export function useSubStageLabel() {
  // 이력 행이 이미 미사용 처리된 버전을 가리킬 수 있어 전체를 받는다.
  const { stages } = useStages(false)

  return (stage: string, subStage: string | undefined): string => {
    if (!subStage) return '-'
    const found = stages.find(
      (s) => s.stage === stage && s.subStage === subStage,
    )
    return found?.versionName ?? subStage
  }
}
