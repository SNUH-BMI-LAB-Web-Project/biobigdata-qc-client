'use client'

import { useCallback, useRef, useState } from 'react'
import {
  sqlChatMessages,
  sqlCreateSession,
  sqlResetSession,
  sqlStream,
  type SqlMessageResponse,
} from '@/lib/api/agent'
import { errorMessage, newId, type AgentChat, type AgentMessage } from './agent-chat'

export function useSqlChat(onDisabled: () => void) {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [pending, setPending] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const sessionId = useRef<string | null>(null)
  const closeStream = useRef<(() => void) | null>(null)

  const stop = useCallback(() => {
    closeStream.current?.()
    closeStream.current = null
    setPending(false)
    setProgress(null)
  }, [])

  const reset = useCallback(() => {
    stop()
    if (sessionId.current) void sqlResetSession(sessionId.current)
    sessionId.current = null
    setMessages([])
  }, [stop])

  const finish = (assistant: AgentMessage) => {
    closeStream.current = null
    setMessages((m) => [...m, assistant])
    setPending(false)
    setProgress(null)
  }

  // 세션 만료(SESSION_NOT_FOUND)나 스트림 미연결이면 새 세션으로 한 번만 재시도
  const run = useCallback(
    async function run(text: string, retried: boolean): Promise<void> {
      try {
        if (!sessionId.current) sessionId.current = (await sqlCreateSession()).session_id
      } catch (err) {
        if ((err as { code?: string })?.code === 'AGENT_DISABLED') onDisabled()
        finish({ id: newId('e'), role: 'assistant', content: errorMessage(err), error: true })
        return
      }
      closeStream.current = sqlStream(sessionId.current, text, {
        onProgress: setProgress,
        onDone: (res: SqlMessageResponse) =>
          finish({ id: newId('a'), role: 'assistant', content: res.message, sql: res }),
        onError: (err) => {
          if (!retried && (err.code === 'SESSION_NOT_FOUND' || err.code === 'STREAM_UNAVAILABLE')) {
            sessionId.current = null
            void run(text, true)
            return
          }
          finish({ id: newId('e'), role: 'assistant', content: err.message, error: true })
        },
      })
    },
    [onDisabled],
  )

  const send = useCallback(
    (text: string) => {
      const message = text.trim().slice(0, 2000) // CliniQ 메시지 한도
      if (!message || pending) return
      setMessages((m) => [...m, { id: newId('u'), role: 'user', content: message }])
      setPending(true)
      setProgress(null)
      void run(message, false)
    },
    [pending, run],
  )

  const openChat = useCallback(
    async (id: string) => {
      stop()
      const list = await sqlChatMessages(id)
      sessionId.current = id // 만료된 세션이면 다음 전송 때 새 세션으로 이어진다
      setMessages(
        list.map((m) => ({
          id: `${id}-${m.seq}`,
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
          sql: m.role === 'assistant' ? (m.payload ?? undefined) : undefined,
          error: m.role === 'system',
        })),
      )
    },
    [stop],
  )

  const chat: AgentChat = { messages, pending, progress, send, stop, reset, openChat }
  return { chat }
}
