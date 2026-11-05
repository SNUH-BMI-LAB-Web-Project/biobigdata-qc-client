'use client'

import { useEffect, useRef } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface AgentComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop: () => void
  /** 응답 대기 중이면 전송 버튼이 중지 버튼으로 바뀐다. */
  pending: boolean
  /** 입력창 좌측 하단 컨트롤 (예: QC 대상 DB 선택) */
  controls?: ReactNode
  placeholder: string
}

const MAX_TEXTAREA_HEIGHT = 200

/** 질문 입력창 — 범위 선택 + 자동 높이 조절 + Enter 전송 */
export function AgentComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  pending,
  controls,
  placeholder,
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
    <div className="bg-transparent">
      <div className="mx-auto w-full max-w-3xl px-6 pb-4">
        <div className="rounded-2xl border bg-card shadow-sm transition-colors focus-within:border-ring/60">
          <Textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-0 resize-none border-0 bg-transparent px-4 pt-3.5 pb-1 shadow-none focus-visible:border-0 focus-visible:ring-0"
          />

          <div className="flex items-center justify-between gap-2 px-3 pb-3">
            <div className="flex items-center gap-2">{controls}</div>

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
      </div>
    </div>
  )
}
