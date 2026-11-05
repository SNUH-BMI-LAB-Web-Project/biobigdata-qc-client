'use client'

import { useCallback, useRef, useState } from 'react'
import { qcChatMessages, qcQuery, type QcCheckType, type QcStage } from '@/lib/api/agent'
import { errorMessage, newId, type AgentChat, type AgentMessage } from './agent-chat'

export function useQcChat(onDisabled: () => void) {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [pending, setPending] = useState(false)
  const [stage, setStage] = useState<QcStage>('INTG')
  const [checkType, setCheckType] = useState<QcCheckType>('quality')
  const sessionId = useRef<string | null>(null)
  const abort = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    abort.current?.abort()
    setPending(false)
  }, [])

  const reset = useCallback(() => {
    stop()
    sessionId.current = null
    setMessages([])
  }, [stop])

  const send = useCallback(
    (text: string) => {
      const question = text.trim()
      if (!question || pending) return
      const controller = new AbortController()
      abort.current = controller
      setMessages((m) => [...m, { id: newId('u'), role: 'user', content: question }])
      setPending(true)

      qcQuery({ sessionId: sessionId.current, question, stage, checkType }, controller.signal)
        .then((res) => {
          sessionId.current = res.session_id
          setMessages((m) => [
            ...m,
            { id: res.message_id, role: 'assistant', content: res.answer, charts: res.charts },
          ])
        })
        .catch((err) => {
          if (controller.signal.aborted) return
          if (err?.code === 'AGENT_DISABLED') onDisabled()
          setMessages((m) => [
            ...m,
            { id: newId('e'), role: 'assistant', content: errorMessage(err), error: true },
          ])
        })
        .finally(() => {
          if (!controller.signal.aborted) setPending(false)
        })
    },
    [pending, stage, checkType, onDisabled],
  )

  const openChat = useCallback(
    async (id: string) => {
      stop()
      const h = await qcChatMessages(id)
      sessionId.current = h.session_id
      setStage(h.stage)
      setCheckType(h.check_type)
      setMessages(
        h.messages.map((m) => ({
          id: m.message_id,
          role: m.role,
          content: m.content,
          charts: m.charts,
        })),
      )
    },
    [stop],
  )

  const chat: AgentChat = { messages, pending, progress: null, send, stop, reset, openChat }
  return { chat, stage, setStage, checkType, setCheckType }
}
