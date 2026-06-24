import { Database } from 'lucide-react'

/** 로그인·회원가입 공통 레이아웃 — 가운데 정렬 + BIKO-DQM 브랜드 헤더 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-balance">BIKO-DQM</h1>
          <p className="text-muted-foreground mt-2 text-pretty">의학 데이터베이스 품질관리 시스템</p>
        </div>
        {children}
      </div>
    </div>
  )
}
