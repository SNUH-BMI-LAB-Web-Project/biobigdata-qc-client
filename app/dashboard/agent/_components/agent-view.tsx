'use client'

import { useEffect, useRef, useState } from 'react'
import { Database, Loader2, SquarePen, ZapOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAgentEnabled } from '@/hooks/use-agent-enabled'
import type { AgentType, QcCheckType, QcStage } from '@/lib/api/agent'
import { AGENT_CONFIG, QC_CHECK_TYPES, QC_STAGES } from './agent-config'
import { AgentComposer } from './agent-composer'
import { AgentGreeting } from './agent-greeting'
import { AgentHistory } from './agent-history'
import { AgentMessageList } from './agent-message-list'
import { useQcChat } from './use-qc-chat'
import { useSqlChat } from './use-sql-chat'

const AGENT_TYPES: readonly AgentType[] = ['QC', 'SQL']

/** Agent 화면 — 왼쪽 위에서 Agent(QC/SQL)를 고르고, 하나라도 켜져 있으면 열린다 */
export function AgentView() {
  const { isEnabled, anyEnabled, loading, refetch } = useAgentEnabled()
  const [selected, setSelected] = useState<AgentType | null>(null)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // 두 Agent의 대화를 각각 유지한다 (전환해도 사라지지 않음)
  const qc = useQcChat(refetch)
  const sql = useSqlChat(refetch)

  // 선택된 Agent가 꺼졌거나 아직 없으면 처음으로 켜진 Agent로
  const active: AgentType | null =
    selected && isEnabled(selected) ? selected : (AGENT_TYPES.find(isEnabled) ?? null)
  const chat = active === 'SQL' ? sql.chat : qc.chat

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.messages, chat.pending])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!anyEnabled || !active) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <ZapOff className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-semibold">{'Agent 기능이 비활성화되어 있습니다'}</h1>
        <p className="text-sm text-muted-foreground">
          {'관리자에 의해 사용이 중지되었습니다. 필요하면 관리자에게 문의하세요.'}
        </p>
      </div>
    )
  }

  const config = AGENT_CONFIG[active]
  const hasConversation = chat.messages.length > 0

  const send = (text: string) => {
    chat.send(text)
    setInput('')
  }

  const reset = () => {
    chat.reset()
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 px-6 py-3">
        <Select value={active} onValueChange={(v) => setSelected(v as AgentType)}>
          <SelectTrigger size="sm" className="h-8 w-auto gap-1.5 border-0 text-sm font-semibold shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AGENT_TYPES.map((type) => (
              <SelectItem key={type} value={type} disabled={!isEnabled(type)}>
                {AGENT_CONFIG[type].title}
                {!isEnabled(type) && ' (비활성)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <AgentHistory key={active} type={active} onOpen={chat.openChat} />
          <Button variant="ghost" size="sm" onClick={reset} disabled={!hasConversation && !input}>
            <SquarePen className="h-4 w-4" />
            {'새 대화'}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {hasConversation ? (
          <AgentMessageList
            messages={chat.messages}
            pending={chat.pending}
            progress={chat.progress}
            onChoose={send}
          />
        ) : (
          <AgentGreeting config={config} />
        )}
        <div ref={bottomRef} />
      </div>

      <AgentComposer
        value={input}
        onChange={setInput}
        onSubmit={() => send(input)}
        onStop={chat.stop}
        pending={chat.pending}
        placeholder={config.placeholder}
        controls={
          active === 'QC' && (
            <>
              <ScopeSelect value={qc.stage} onChange={(v) => qc.setStage(v as QcStage)} options={QC_STAGES} withIcon />
              <ScopeSelect value={qc.checkType} onChange={(v) => qc.setCheckType(v as QcCheckType)} options={QC_CHECK_TYPES} />
            </>
          )
        }
      />
    </div>
  )
}

function ScopeSelect({
  value,
  onChange,
  options,
  withIcon,
}: {
  value: string
  onChange: (value: string) => void
  options: readonly { id: string; name: string }[]
  withIcon?: boolean
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className="h-8 w-auto gap-1.5 rounded-full border-dashed text-xs text-muted-foreground">
        {withIcon && <Database className="h-3.5 w-3.5" />}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
