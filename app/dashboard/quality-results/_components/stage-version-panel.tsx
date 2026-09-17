'use client'

import { Database, FileCheck } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useStages } from '@/hooks/use-stages'

interface StageVersionPanelProps {
  selectedStage: string | null
  selectedSubStage: string | null
  onSelect: (stage: string, subStage: string | null) => void
}

/**
 * 조회 대상 DB / 데이터 버전 선택 패널 — 검증 실행 화면과 같은 2단 선택.
 * 연계DB는 dq_stage에 등록 행이 없어 버전 선택을 건너뛰고 DB 선택만으로 조회한다.
 */
export function StageVersionPanel({
  selectedStage,
  selectedSubStage,
  onSelect,
}: StageVersionPanelProps) {
  // 실행 이력이 이미 미사용 처리된 버전을 가리킬 수 있어 전체 버전을 받는다.
  // groups: 검증 실행 화면과 동일하게 dq_stage에 등록된 단계 + 연계DB(LINK, 등록 행 없음)만 노출.
  // 새 DB 단계가 늘어나도 관리자가 dq_stage에 등록하면 코드 변경 없이 그대로 반영된다.
  const { groups: ordered, loading, error } = useStages(false)

  const selectedGroup = ordered.find((g) => g.stage === selectedStage)
  const requiresSubStage = (selectedGroup?.versions.length ?? 0) > 0

  return (
    <div className="grid md:grid-cols-2 gap-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            {'1. 조회 대상 DB'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading || error ? (
            <SelectionEmpty
              message={
                loading
                  ? '개방 단계를 불러오는 중...'
                  : (error ?? '등록된 개방 단계가 없습니다')
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {ordered.map((group) => (
                <SelectionOption
                  key={group.stage}
                  selected={selectedStage === group.stage}
                  label={group.label}
                  onClick={() =>
                    onSelect(
                      group.stage,
                      // 버전이 없는 단계(연계DB)는 DB 선택만으로 곧장 조회한다.
                      group.versions.length > 0 ? null : '',
                    )
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            {'2. 조회 대상 데이터'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedStage ? (
            <SelectionEmpty message="먼저 조회 대상 DB를 선택하세요" />
          ) : !requiresSubStage ? (
            <SelectionEmpty
              message={`${selectedGroup?.label ?? '이 단계'}는 개방 단계 구분이 없습니다`}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {selectedGroup?.versions.map((version) => (
                <SelectionOption
                  key={version.subStage}
                  selected={selectedSubStage === version.subStage}
                  label={version.versionName || version.subStage}
                  onClick={() => onSelect(selectedStage, version.subStage)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SelectionOption({
  selected,
  label,
  onClick,
}: {
  selected: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`w-full text-left p-2.5 rounded-lg border-2 transition-all ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      }`}
      onClick={onClick}
    >
      <div className="text-sm font-medium">{label}</div>
    </button>
  )
}

function SelectionEmpty({ message }: { message: string }) {
  return (
    <p className="text-xs text-muted-foreground text-center py-6">{message}</p>
  )
}
