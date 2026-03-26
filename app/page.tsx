import { Database } from 'lucide-react'
import { LoginForm } from './_components/login-form'

export default function LoginPage() {
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

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground mt-6">
          &copy; 2024 BIKO-DQM. 의학 데이터 품질 관리 시스템
        </p>
      </div>
    </div>
  )
}
