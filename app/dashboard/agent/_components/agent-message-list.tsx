'use client'

import { Copy, RotateCcw, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface AgentMessageListProps {
  messages: readonly AgentMessage[]
  /** 마지막 응답을 생성 중인지 — 타이핑 인디케이터 노출 여부 */
  pending: boolean
}

/** 대화 말풍선 목록 — 사용자는 우측 정렬, 에이전트는 아바타 + 좌측 정렬 */
export function AgentMessageList({ messages, pending }: AgentMessageListProps) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-8">
      {messages.map((message) =>
        message.role === 'user' ? (
          <div key={message.id} className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground">
              {message.content}
            </div>
          </div>
        ) : (
          <div key={message.id} className="flex gap-3">
            <AgentAvatar />
            <div className="min-w-0 flex-1">
              <div className="rounded-2xl rounded-tl-sm border bg-card px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
              <MessageActions />
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
          </div>
        </div>
      )}
    </div>
  )
}

function AgentAvatar() {
  return (
    <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Sparkles className="h-4 w-4" />
    </span>
  )
}

/** 응답 하단 액션 — 외형 전용이라 클릭해도 동작하지 않는다. */
function MessageActions() {
  const actions = [
    { icon: Copy, label: '복사' },
    { icon: RotateCcw, label: '다시 생성' },
    { icon: ThumbsUp, label: '도움됨' },
    { icon: ThumbsDown, label: '도움 안 됨' },
  ]

  return (
    <div className="mt-1.5 flex items-center gap-0.5">
      {actions.map(({ icon: Icon, label }) => (
        <Button
          key={label}
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          className="h-7 w-7 text-muted-foreground"
        >
          <Icon className="h-3.5 w-3.5" />
        </Button>
      ))}
    </div>
  )
}
