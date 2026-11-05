'use client'

import { useState } from 'react'
import { Check, Copy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AgentMessage } from './agent-chat'
import { AgentMarkdown } from './agent-markdown'
import { AgentCharts } from './agent-charts'
import { AgentSqlResult } from './agent-sql-result'

interface AgentMessageListProps {
  messages: readonly AgentMessage[]
  /** 마지막 응답을 생성 중인지 — 타이핑 인디케이터 노출 여부 */
  pending: boolean
  /** 진행 단계 문구 (SQL Agent) */
  progress: string | null
  onChoose: (value: string) => void
}

/** 대화 말풍선 목록 — 사용자는 우측 정렬, 에이전트는 아바타 + 좌측 정렬 */
export function AgentMessageList({ messages, pending, progress, onChoose }: AgentMessageListProps) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-8">
      {messages.map((message, i) =>
        message.role === 'user' ? (
          <div key={message.id} className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground">
              {message.content}
            </div>
          </div>
        ) : (
          <div key={message.id}>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  'rounded-2xl rounded-tl-sm border bg-card px-4 py-3 text-sm leading-relaxed',
                  message.error && 'border-destructive/40 text-destructive whitespace-pre-wrap',
                )}
              >
                {message.sql ? (
                  <AgentSqlResult
                    data={message.sql}
                    onChoose={onChoose}
                    canChoose={!pending && i === messages.length - 1}
                  />
                ) : message.error ? (
                  message.content
                ) : (
                  <AgentMarkdown>{message.content}</AgentMarkdown>
                )}
              </div>
              {message.charts && message.charts.length > 0 && <AgentCharts charts={message.charts} />}
              <CopyButton text={message.content} />
            </div>
          </div>
        ),
      )}

      {pending && (
        <div className="flex gap-3">
          <AgentAvatar />
          <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border bg-card px-4 py-4">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                style={{ animationDelay: `${index * 0.15}s` }}
              />
            ))}
            {progress && <span className="ml-2 text-xs text-muted-foreground">{progress}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

function AgentAvatar() {
  return (
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Sparkles className="h-4 w-4" />
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <Button variant="ghost" size="icon-sm" aria-label="복사" onClick={copy} className="mt-1.5 h-7 w-7 text-muted-foreground">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  )
}
