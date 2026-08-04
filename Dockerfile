# syntax=docker/dockerfile:1.7
# biobigdata-qc-client (메인 웹) — Rocky Linux 9 / x86_64(amd64), Node.js 22, pnpm
# 서버와 OS·아키텍처를 일치시키기 위해 Rocky 9 베이스를 사용합니다.

# Node.js 22 를 설치한 공통 베이스 (NodeSource 공식 setup 스크립트로 repo 등록)
FROM rockylinux:9 AS node-base
RUN curl -fsSL https://rpm.nodesource.com/setup_22.x | bash - \
 && dnf -y install nodejs \
 && dnf clean all \
 && rm -rf /var/cache/dnf \
 && corepack enable \
 && corepack prepare pnpm@10.30.1 --activate

# 1) deps: 의존성 설치 전용 레이어 (캐시 효율)
FROM node-base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 2) builder: Next.js standalone 빌드
FROM node-base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm build

# 3) runner: 런타임 최소 이미지
FROM node-base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
