'use client'

import { useEffect, useRef, useState } from 'react'
import { SquarePen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AGENT_SCOPES } from './agent-config'
import { AgentComposer } from './agent-composer'
import { AgentGreeting } from './agent-greeting'
import { AgentMessageList, type AgentMessage } from './agent-message-list'

/** 데이터 연결 전까지 모든 질문에 동일하게 노출되는 자리표시 응답 */
const PLACEHOLDER_ANSWER =
  '아직 품질 검증 데이터에 연결되어 있지 않습니다.\n연결이 완료되면 검증 실행 이력과 지표 결과를 근거로 답변해 드릴게요.'

/** 응답이 도착하기까지 보여줄 타이핑 인디케이터 시간(ms) */
const FAKE_RESPONSE_DELAY = 900

/** 품질 검증 Agent 화면 — 인사말·빠른 질문·대화·입력창을 조합한 외형 전용 뷰 */
export function AgentView() {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [scope, setScope] = useState(AGENT_SCOPES[0].id)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const hasConversation = messages.length > 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const send = (text: string) => {
    const content = text.trim()
    if (!content || pending) return

    setMessages((prev) => [...prev, { id: `${Date.now()}-user`, role: 'user', content }])
    setInput('')
    setPending(true)

    timerRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: PLACEHOLDER_ANSWER,
        },
      ])
      setPending(false)
    }, FAKE_RESPONSE_DELAY)
  }

  const handleStop = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setPending(false)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMessages([])
    setInput('')
    setPending(false)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 px-6 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">{'품질 검증 Agent'}</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={!hasConversation && !input}
        >
          <SquarePen className="h-4 w-4" />
          {'새 대화'}
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {hasConversation ? (
          <AgentMessageList messages={messages} pending={pending} />
        ) : (
          <AgentGreeting onQuickQuestion={send} />
        )}
        <div ref={bottomRef} />
      </div>

      <AgentComposer
        value={input}
        onChange={setInput}
        onSubmit={() => send(input)}
        onStop={handleStop}
        pending={pending}
        scope={scope}
        onScopeChange={setScope}
        showSuggestions={hasConversation}
      />
    </div>
  )
}
