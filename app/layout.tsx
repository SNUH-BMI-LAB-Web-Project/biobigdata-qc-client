import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const pretendardGov = localFont({
  src: './fonts/PretendardGOVVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard-gov',
})

export const metadata: Metadata = {
  title: 'BIKO-DQM - 의학 데이터베이스 품질관리',
  description: '의학 데이터베이스 품질검증 및 관리 시스템',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendardGov.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
