'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AgentMarkdown } from './agent-markdown'
import type { SqlMessageResponse, SqlRule } from '@/lib/api/agent'

/** SQL Agent 응답을 type(clarification/rules/duplicate/failed/info)별로 렌더링 */
export function AgentSqlResult({
  data,
  onChoose,
  canChoose,
}: {
  data: SqlMessageResponse
  onChoose: (value: string) => void
  /** 가장 마지막 응답일 때만 선택지를 누를 수 있다 */
  canChoose: boolean
}) {
  return (
    <div className="space-y-3">
      <AgentMarkdown>{data.clarification?.message ?? data.message}</AgentMarkdown>

      {data.type === 'clarification' && (data.clarification?.choices.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.clarification?.choices.map((c) => (
            <Button
              key={c.value}
              variant="outline"
              size="sm"
              disabled={!canChoose}
              onClick={() => onChoose(c.value)}
              title={c.description}
            >
              {c.label}
            </Button>
          ))}
        </div>
      )}

      {data.type === 'failed' && data.failure_reason && (
        <p className="text-destructive">{data.failure_reason}</p>
      )}

      {data.duplicates.map((d, i) => (
        <div key={i} className="rounded-lg border border-dashed p-3 text-xs">
          {d.existing_rule_name && <p className="font-medium">{d.existing_rule_name}</p>}
          <p className="text-muted-foreground">{d.reason}</p>
        </div>
      ))}

      {data.rules.map((rule) => (
        <RuleCard key={rule.rule_id} rule={rule} />
      ))}
    </div>
  )
}

function RuleCard({ rule }: { rule: SqlRule }) {
  const r = rule.result
  return (
    <div className="space-y-2 rounded-xl border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{rule.name}</span>
        {rule.dq_dimension_label && <Badge variant="secondary">{rule.dq_dimension_label}</Badge>}
        <Badge variant={rule.severity === 'error' ? 'destructive' : 'outline'}>
          {rule.severity_label ?? rule.severity}
        </Badge>
      </div>
      {rule.description && (
        <p className={rule.description.startsWith('가정:') ? 'text-xs text-amber-600' : 'text-xs text-muted-foreground'}>
          {rule.description}
        </p>
      )}
      {rule.logic && <p className="text-xs">{rule.logic}</p>}
      {rule.sql && (
        <pre className="max-h-60 overflow-auto rounded-lg bg-muted p-3 text-xs">{rule.sql}</pre>
      )}
      {r &&
        (r.success ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant={r.passed ? 'default' : 'destructive'}>{r.passed ? '합격' : '불합격'}</Badge>
            {r.violation_ratio != null && <span>{`위반율 ${(r.violation_ratio * 100).toFixed(2)}%`}</span>}
            {r.violation_count != null && (
              <span className="text-muted-foreground">
                {`(${r.violation_count.toLocaleString()} / ${(r.denominator_count ?? 0).toLocaleString()})`}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-destructive">{r.error_message ?? '실행에 실패했습니다.'}</p>
        ))}
    </div>
  )
}
