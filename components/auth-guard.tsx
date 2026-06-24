'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { generatedApi, unwrapGeneratedResult } from '@/lib/api'

/**
 * 로그인 가드 — 마운트 시 세션(/api/auth/me)을 확인한다.
 * 세션이 없으면(401 등) 로그인 화면으로 리다이렉트한다.
 * 보호가 필요한 라우트(대시보드/프로필)를 감싸 사용.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'authed'>('checking')

  useEffect(() => {
    let active = true
    generatedApi
      .GET('/api/auth/me')
      .then(unwrapGeneratedResult)
      .then(() => {
        if (active) setStatus('authed')
      })
      .catch(() => {
        // 미인증 → 로그인 화면으로
        router.replace('/')
      })
    return () => {
      active = false
    }
  }, [router])

  if (status === 'checking') {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
