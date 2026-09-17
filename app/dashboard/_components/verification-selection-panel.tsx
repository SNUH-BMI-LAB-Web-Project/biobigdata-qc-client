'use client'

import { Database, FileCheck, Loader2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { VERIFICATION_INDICATOR_TYPES } from './verification-config'
import type { StageGroup } from '@/hooks/use-stages'

interface VerificationSelectionPanelProps {
  stageGroups: StageGroup[]
  stagesLoading: boolean
  stagesError: string | null
  selectedDb: string
  selectedSubStage: string
  selectedIndicator: string
  requiresSubStage: boolean
  hasRunningVerification: boolean
  submitting: boolean
  canExecute: boolean
  onDbChange: (dbId: string) => void
  onSubStageChange: (subStage: string) => void
  onIndicatorChange: (indicatorId: string) => void
  onExecute: () => void
}

export function VerificationSelectionPanel({
  stageGroups,
  stagesLoading,
  stagesError,
  selectedDb,
  selectedSubStage,
  selectedIndicator,
  requiresSubStage,
  hasRunningVerification,
  submitting,
  canExecute,
  onDbChange,
  onSubStageChange,
  onIndicatorChange,
  onExecute,
}: VerificationSelectionPanelProps) {
  const selectedGroup = stageGroups.find((group) => group.stage === selectedDb)
  const selectedVersion = selectedGroup?.versions.find(
    (version) => version.subStage === selectedSubStage,
  )
  const indicatorInfo = VERIFICATION_INDICATOR_TYPES.find(
    (type) => type.id === selectedIndicator,
  )

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            {'1. 검증 대상 DB'}
          </CardTitle>
          <CardDescription className="text-xs">
            {'검증할 데이터베이스를 선택하세요'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stagesLoading ? (
            <SelectionEmpty message="개방 단계를 불러오는 중..." />
          ) : stagesError ? (
            <SelectionEmpty message={stagesError} />
          ) : stageGroups.length === 0 ? (
            <SelectionEmpty message="등록된 개방 단계가 없습니다" />
          ) : (
            <div className="space-y-2">
              {stageGroups.map((group) => (
                <SelectionOption
                  key={group.stage}
                  selected={selectedDb === group.stage}
                  label={group.label}
                  onClick={() => onDbChange(group.stage)}
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
            {'2. 검증 대상 데이터'}
          </CardTitle>
          <CardDescription className="text-xs">
            {'검증할 개방 버전을 선택하세요'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedDb ? (
            <SelectionEmpty message="먼저 검증 대상 DB를 선택하세요" />
          ) : !requiresSubStage ? (
            <SelectionEmpty
              message={`${selectedGroup?.label ?? '이 단계'}는 개방 단계 구분이 없습니다`}
            />
          ) : (
            <div className="space-y-2">
              {selectedGroup?.versions.map((version) => (
                <SelectionOption
                  key={version.subStage}
                  selected={selectedSubStage === version.subStage}
                  label={version.versionName}
                  onClick={() => onSubStageChange(version.subStage)}
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
            {'3. 검증 지표 유형'}
          </CardTitle>
          <CardDescription className="text-xs">
            {'실행할 지표 유형을 하나 선택하세요'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!selectedDb || (requiresSubStage && !selectedSubStage) ? (
            <SelectionEmpty
              message="먼저 검증 대상 DB / 데이터를 선택하세요"
              compact
            />
          ) : (
            <div className="space-y-2">
              {VERIFICATION_INDICATOR_TYPES.map((indicator) => {
                const Icon = indicator.icon
                return (
                  <SelectionOption
                    key={indicator.id}
                    selected={selectedIndicator === indicator.id}
                    label={indicator.name}
                    icon={<Icon className="w-4 h-4 text-muted-foreground" />}
                    onClick={() => onIndicatorChange(indicator.id)}
                  />
                )
              })}
            </div>
          )}

          {selectedIndicator === 'stats' && (
            <p className="text-xs text-muted-foreground">
              {'통계지표는 전체 검증만 지원합니다'}
            </p>
          )}

          <div className="pt-3 border-t">
            <Button
              className="w-full gap-2"
              disabled={!canExecute || hasRunningVerification || submitting}
              onClick={onExecute}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {'검증 실행'}
            </Button>
            {hasRunningVerification && (
              <p className="text-xs text-yellow-600 text-center mt-2">
                {'진행 중인 검증이 완료된 후 실행할 수 있습니다'}
              </p>
            )}
            {canExecute && !hasRunningVerification && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                {selectedGroup?.label}
                {requiresSubStage && ` / ${selectedVersion?.versionName ?? ''}`}
                {' / '}
                {indicatorInfo?.name}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SelectionOption({
  selected,
  label,
  icon,
  onClick,
}: {
  selected: boolean
  label: string
  icon?: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`w-full text-left p-3 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      }`}
      onClick={onClick}
    >
      <span className="flex items-center gap-2">
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </span>
    </button>
  )
}

function SelectionEmpty({
  message,
  compact = false,
}: {
  message: string
  compact?: boolean
}) {
  return (
    <div
      className={`text-sm text-muted-foreground text-center ${compact ? 'py-2' : 'py-4'}`}
    >
      {message}
    </div>
  )
}
