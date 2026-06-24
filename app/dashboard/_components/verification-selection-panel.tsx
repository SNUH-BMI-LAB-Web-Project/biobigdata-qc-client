'use client'

import { Database, FileCheck, Loader2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  VERIFICATION_DATABASES,
  VERIFICATION_INDICATOR_TYPES,
  VERIFICATION_SUB_STAGES,
} from './verification-config'

interface VerificationSelectionPanelProps {
  selectedDb: string
  selectedSubStage: string
  selectedIndicators: string[]
  requiresSubStage: boolean
  hasRunningVerification: boolean
  submitting: boolean
  canExecute: boolean
  onDbChange: (dbId: string) => void
  onSubStageChange: (subStage: string) => void
  onIndicatorToggle: (indicatorId: string) => void
  onExecute: () => void
}

export function VerificationSelectionPanel({
  selectedDb,
  selectedSubStage,
  selectedIndicators,
  requiresSubStage,
  hasRunningVerification,
  submitting,
  canExecute,
  onDbChange,
  onSubStageChange,
  onIndicatorToggle,
  onExecute,
}: VerificationSelectionPanelProps) {
  const selectedDbInfo = VERIFICATION_DATABASES.find((db) => db.id === selectedDb)

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            {'1. 검증 대상 DB'}
          </CardTitle>
          <CardDescription className="text-xs">{'검증할 데이터베이스를 선택하세요'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {VERIFICATION_DATABASES.map((db) => (
              <button
                key={db.id}
                type="button"
                className={`w-full text-left p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedDb === db.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => onDbChange(db.id)}
              >
                <span className="block font-medium text-sm">{db.name}</span>
                <span className="block text-xs text-muted-foreground mt-0.5">{db.description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            {'2. 검증 대상 데이터'}
          </CardTitle>
          <CardDescription className="text-xs">{'사전 개방 / 본 개방을 선택하세요'}</CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedDb ? (
            <SelectionEmpty message="먼저 검증 대상 DB를 선택하세요" />
          ) : !requiresSubStage ? (
            <SelectionEmpty message="연계DB는 사전/본 개방 구분이 없습니다" />
          ) : (
            <div className="space-y-2">
              {VERIFICATION_SUB_STAGES.map((subStage) => (
                <button
                  type="button"
                  key={subStage.id}
                  className={`flex w-full items-center gap-2 p-3 rounded-md border-2 cursor-pointer transition-all ${
                    selectedSubStage === subStage.id
                      ? 'bg-primary/10 border-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onClick={() => onSubStageChange(subStage.id)}
                >
                  <Checkbox checked={selectedSubStage === subStage.id} onCheckedChange={() => onSubStageChange(subStage.id)} />
                  <span className="text-sm">{subStage.name}</span>
                </button>
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
          <CardDescription className="text-xs">{'실행할 지표 유형을 선택하세요'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!selectedDb || (requiresSubStage && !selectedSubStage) ? (
            <SelectionEmpty message="먼저 검증 대상 DB / 데이터를 선택하세요" compact />
          ) : (
            <div className="space-y-2">
              {VERIFICATION_INDICATOR_TYPES.map((indicator) => {
                const Icon = indicator.icon
                const selected = selectedIndicators.includes(indicator.id)
                return (
                  <button
                    key={indicator.id}
                    type="button"
                    className={`flex w-full items-center gap-3 p-2 rounded-md border cursor-pointer transition-colors ${
                      selected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => onIndicatorToggle(indicator.id)}
                  >
                    <Checkbox checked={selected} onCheckedChange={() => onIndicatorToggle(indicator.id)} />
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium flex-1 text-left">{indicator.name}</span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="pt-3 border-t">
            <Button
              className="w-full gap-2"
              disabled={!canExecute || hasRunningVerification || submitting}
              onClick={onExecute}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {'선택 항목 검증 실행'}
            </Button>
            {hasRunningVerification && (
              <p className="text-xs text-yellow-600 text-center mt-2">
                {'진행 중인 검증이 완료된 후 실행할 수 있습니다'}
              </p>
            )}
            {canExecute && !hasRunningVerification && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                {selectedDbInfo?.name}
                {requiresSubStage && ` / ${VERIFICATION_SUB_STAGES.find((stage) => stage.id === selectedSubStage)?.name}`}
                {' / '}
                {selectedIndicators.length}
                {'개 지표'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SelectionEmpty({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div className={`text-sm text-muted-foreground text-center ${compact ? 'py-2' : 'py-4'}`}>
      {message}
    </div>
  )
}
