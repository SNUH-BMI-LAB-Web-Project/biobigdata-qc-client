'use client'

import { useEffect, useRef } from 'react'
import { ArrowUp, Database, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AGENT_SCOPES, FOLLOW_UP_SUGGESTIONS } from './agent-config'

interface AgentComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop: () => void
  /** 응답 대기 중이면 전송 버튼이 중지 버튼으로 바뀐다. */
  pending: boolean
  scope: string
  onScopeChange: (scope: string) => void
  /** 대화가 시작된 뒤에만 후속 질문 칩을 노출한다. */
  showSuggestions: boolean
}

const MAX_TEXTAREA_HEIGHT = 200

/** 질문 입력창 — 범위 선택 + 자동 높이 조절 + Enter 전송 */
export function AgentComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  pending,
  scope,
  onScopeChange,
  showSuggestions,
}: AgentComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }, [value])

  const canSubmit = value.trim().length > 0 && !pending

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return

    event.preventDefault()
    if (canSubmit) onSubmit()
  }

  return (
    <div className="border-t bg-background">
      <div className="mx-auto w-full max-w-3xl px-6 py-4">
        {showSuggestions && (
          <div className="mb-3 flex flex-wrap gap-2">
            {FOLLOW_UP_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onChange(suggestion)}
                className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-2xl border bg-card shadow-sm transition-colors focus-within:border-ring/60">
          <Textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="데이터 검증 결과에 대해 물어보세요"
            className="min-h-0 resize-none border-0 bg-transparent px-4 pt-3.5 pb-1 shadow-none focus-visible:border-0 focus-visible:ring-0"
          />

          <div className="flex items-center justify-between gap-2 px-3 pb-3">
            <Select value={scope} onValueChange={onScopeChange}>
              <SelectTrigger
                size="sm"
                className="h-8 w-auto gap-1.5 rounded-full border-dashed text-xs text-muted-foreground"
              >
                <Database className="h-3.5 w-3.5" />
                <SelectValue placeholder="검증 범위" />
              </SelectTrigger>
              <SelectContent>
                {AGENT_SCOPES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {pending ? (
              <Button
                size="icon-sm"
                variant="secondary"
                aria-label="응답 중지"
                onClick={onStop}
                className="rounded-full"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                size="icon-sm"
                aria-label="질문 전송"
                disabled={!canSubmit}
                onClick={onSubmit}
                className="rounded-full"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          {'AI 응답은 참고용이며, 중요한 판단 전에는 원본 검증 결과를 확인하세요.'}
        </p>
      </div>
    </div>
  )
}
