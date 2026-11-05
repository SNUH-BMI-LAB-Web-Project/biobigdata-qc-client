'use client'

import { useState } from 'react'
import { History, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApi } from '@/hooks/use-api'
import { qcChats, sqlChats, sqlDeleteChat, type AgentType } from '@/lib/api/agent'

interface Item {
  id: string
  title: string
  updatedAt: string
  inactive: boolean
}

const load = async (type: AgentType): Promise<Item[]> =>
  type === 'QC'
    ? (await qcChats()).items.map((c) => ({ id: c.session_id, title: c.title, updatedAt: c.updated_at, inactive: false }))
    : (await sqlChats()).items.map((c) => ({ id: c.chat_id, title: c.title, updatedAt: c.updated_at, inactive: !c.active }))

/** 지난 대화 목록 팝오버 — 열 때마다 다시 조회한다 */
export function AgentHistory({ type, onOpen }: { type: AgentType; onOpen: (id: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <History className="h-4 w-4" />
          {'지난 대화'}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-1">
        {open && <HistoryList type={type} onOpen={(id) => onOpen(id).finally(() => setOpen(false))} />}
      </PopoverContent>
    </Popover>
  )
}

function HistoryList({ type, onOpen }: { type: AgentType; onOpen: (id: string) => Promise<void> }) {
  const { data, loading, error, refetch } = useApi(() => load(type), [type])
  if (loading && !data) return <p className="p-3 text-xs text-muted-foreground">{'불러오는 중…'}</p>
  if (error) return <p className="p-3 text-xs text-destructive">{error}</p>
  if (!data?.length) return <p className="p-3 text-xs text-muted-foreground">{'지난 대화가 없습니다.'}</p>

  return (
    <ul>
      {data.map((item) => (
        <li key={item.id} className="group flex items-center rounded-md hover:bg-accent">
          <button type="button" onClick={() => void onOpen(item.id)} className="min-w-0 flex-1 px-3 py-2 text-left">
            <span className="block truncate text-sm">{item.title}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(item.updatedAt).toLocaleString('ko-KR')}
              {item.inactive && ' · 만료됨'}
            </span>
          </button>
          {type === 'SQL' && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="대화 삭제"
              className="mr-1 h-7 w-7 opacity-0 group-hover:opacity-100"
              onClick={() => void sqlDeleteChat(item.id).then(refetch)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
