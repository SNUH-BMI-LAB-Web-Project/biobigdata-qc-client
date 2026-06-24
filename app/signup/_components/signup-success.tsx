'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/** 가입 신청 완료 화면 (관리자 승인 대기 안내) */
export function SignupSuccess() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center text-center gap-4 py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">가입 신청 완료</h2>
            <p className="text-sm text-muted-foreground mt-2 text-pretty">
              관리자 승인 후 로그인할 수 있습니다.
              <br />
              승인까지 잠시 기다려 주세요.
            </p>
          </div>
          <Button className="w-full" onClick={() => router.push('/')}>
            로그인 화면으로
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
