/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 브라우저는 같은 출처 /api/* 를 호출 → Next 서버가 BACKEND_URL 로 프록시한다.
  // BACKEND_URL 은 런타임 server 환경변수(NEXT_PUBLIC_ 아님) → 재빌드 없이 환경별 전환 가능.
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://175.106.96.71:8081'
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
