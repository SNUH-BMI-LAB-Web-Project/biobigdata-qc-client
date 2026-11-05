'use client'

import { Sparkles } from 'lucide-react'
import type { AgentUiConfig } from './agent-config'

interface AgentGreetingProps {
  config: AgentUiConfig
}

/** 대화 시작 전 화면 — 인사말 */
export function AgentGreeting({ config }: AgentGreetingProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{config.heading}</h1>
        <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">{config.description}</p>
      </div>
    </div>
  )
}
