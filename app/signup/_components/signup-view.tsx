'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthLayout } from '@/components/layout/auth-layout'
import { SignupForm } from './signup-form'
import { SignupSuccess } from './signup-success'

export function SignupView() {
  const [done, setDone] = useState(false)

  if (done) return <SignupSuccess />

  return (
    <AuthLayout>
      <SignupForm onDone={() => setDone(true)} />
      <p className="text-center text-sm text-muted-foreground mt-6">
        이미 계정이 있으신가요?{' '}
        <Link href="/" className="text-primary font-medium hover:underline">
          로그인
        </Link>
      </p>
    </AuthLayout>
  )
}
