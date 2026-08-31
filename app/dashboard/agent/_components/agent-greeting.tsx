'use client'

import { Sparkles } from 'lucide-react'
import { QUICK_QUESTIONS } from './agent-config'

interface AgentGreetingProps {
  userName?: string
  onQuickQuestion: (prompt: string) => void
}

/** 대화 시작 전 화면 — 인사말 + 빠른 질문 4개 카드 */
export function AgentGreeting({ onQuickQuestion }: AgentGreetingProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">무엇이 궁금하신가요?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          DB별 품질 점수, 검증 실행 내역, 지표별 결과 등
          <br />
          데이터 품질 검증에 대해 물어보세요.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {QUICK_QUESTIONS.map((question) => {
          const Icon = question.icon

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onQuickQuestion(question.prompt)}
              className="group flex h-full items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{question.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {question.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
