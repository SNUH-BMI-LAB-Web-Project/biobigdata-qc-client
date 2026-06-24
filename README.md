# BIKO-DQM — 의학 바이오 빅데이터 품질관리 대시보드 (Web Client)

> 서울대학교병원 의생명연구원(SNUH BMI-LAB)에서 운영하는 **의학 데이터베이스 품질검증·통계 대시보드**의 프런트엔드입니다.
> 백엔드(Spring 기반 QC 서버)와 Airflow DAG가 수행한 품질/통계 검증 결과를 조회하고, 검증 실행을 트리거하며, 지표·테이블 메타데이터를 관리합니다.

---

## 1. 한눈에 보기

| 항목 | 내용 |
|------|------|
| 제품명 | BIKO-DQM (품질관리 대시보드) |
| 형태 | 사내 운영자용 웹 대시보드 (SSR + CSR 혼합, Next.js App Router) |
| 사용자 | 관리자(ADMIN) / 매니저(MANAGER) / 뷰어(VIEWER) — 세션(쿠키) 로그인 |
| 백엔드 | QC 서버 REST API (`http://175.106.96.71:8081`), OpenAPI 3 문서 제공 |
| 배포 | Docker(standalone) — 컨테이너명 `gukba-big`, 호스트 포트 **8887** → 컨테이너 3000 |

---

## 2. 무엇을 하는 서비스인가 (도메인)

의학 데이터는 여러 단계의 DB를 거치며 정제·통합·개방됩니다. 각 단계 데이터가 **정해진 품질 기준**(필수값 존재, 형식 정합, 코드 유효성 등)과 **통계 분포**(Achilles 기반)를 만족하는지 검증해야 합니다. 이 대시보드는 그 검증을 **실행**하고 **결과를 시각화**하며 **검증에 쓰이는 지표/테이블 정의를 조회·관리**합니다.

### 2.1 DB 단계 (stage)
| 코드 | 한글명 | 설명 |
|------|--------|------|
| `LINK` | 연계DB | 원천 데이터 연계 저장소 |
| `COLL` | 수집DB | 수집 단계 (UI에는 노출하지 않음) |
| `PREP` | 전처리DB | 정제·전처리 저장소 |
| `INTG` | 통합DB | 통합 데이터 저장소 |
| `OPEN` | 개방DB | 데이터 개방 저장소 |

- 전처리/통합/개방 단계는 **사전 개방(preview_open) / 본 개방(main_open)** 서브 단계로 구분합니다. 연계DB는 구분하지 않습니다.

### 2.2 지표 유형
- **품질지표 (quality)** — `dq_quality_metric`. 완전성/정합성/타당성 등 차원별 규칙. 단계별 통과율(점수)로 표시.
- **통계지표 (achilles)** — `dq_statistics_metric`. OHDSI Achilles 분석 기반의 분포/카운트 통계.

### 2.3 검증 상태 (check_status)
`0` 진행중 · `1` 완료 · `2` 오류 · `3` 중단

### 2.4 품질 점수 색상 기준 (조회 전용)
우수 **95점 이상**(녹색) · 양호 **85~94점**(노랑) · 보통 **75점 미만**(빨강). 값은 `lib/quality-score.ts` 단일 소스.

---

## 3. 화면(라우트)별 기능

| 경로 | 화면 | 설명 |
|------|------|------|
| `/` | 로그인 | 세션 로그인 (`POST /api/auth/login`) |
| `/signup` | 회원가입 | `POST /api/members/signup` |
| `/dashboard` | **품질검증 실행** | 검증 대상(DB·서브단계·지표유형) 선택 → 품질/통계 DAG 트리거. 하단 **검증 현황** 표(상태·실행자·기간, 행 클릭 시 단계별 상세) |
| `/dashboard/quality-results` | **데이터 품질 결과** | 단계별 점수 카드 → 검증 실행 내역(5건/페이지) → 선택 시 지표별 통과율 결과 |
| `/dashboard/data` | **데이터 통계 결과** | DB별 검증 건수 카드 → 통계 검증 실행 내역 → 선택 시 단순값/분포(차트+표) |
| `/dashboard/indicators` | **지표DB 관리** | 탭 3개: 테이블 목록(dq_table+dq_field), 품질지표, 통계지표 (검색·페이징, 활성/비활성 표시) |
| `/dashboard/indicators/[id]` | 품질지표 상세 | 지표 정보·단계별 통과율·적용 대상 테이블/컬럼 |
| `/api/[...path]` | 백엔드 프록시 | 모든 `/api/*` 요청을 `BACKEND_URL`로 전달(서버 라우트) |

공통 셸: 상단 헤더(로고·사용자명·로그아웃) + 좌측 사이드바 + 하단 "품질 점수 기준" 팝오버. 헤더의 사용자명을 누르면 **계정 모달**(정보·비밀번호 변경·회원탈퇴)이 뜹니다.

---

## 4. 기술 스택

- **Next.js 16.1.6** (App Router, Turbopack, `output: 'standalone'`)
- **React 19.2.4** + **TypeScript 5.7.3**
- **Tailwind CSS v4** (`@tailwindcss/postcss`) + shadcn 스타일 UI(Radix primitives) — `components/ui/*`
- **lucide-react** 아이콘, **recharts** 통계 차트
- **openapi-fetch** + **openapi-typescript** — 백엔드 OpenAPI 스펙에서 타입 클라이언트 자동 생성

---

## 5. 아키텍처

### 5.1 디렉터리 구조
```
app/
  layout.tsx                 # 루트 레이아웃
  page.tsx                   # 로그인
  signup/page.tsx            # 회원가입
  api/[...path]/route.ts     # 백엔드 프록시(서버)
  dashboard/
    layout.tsx               # AuthGuard + DashboardShell (최소)
    page.tsx                 # 페이지는 뷰 컴포넌트만 import (최소화)
    _components/             # 대시보드 공통 컴포넌트
      dashboard-shell.tsx       # 헤더+사이드바+계정모달 (공통 레이아웃)
      account-dialog.tsx        # 계정 모달(비밀번호 변경/회원탈퇴)
      quality-score-popover.tsx # 품질 점수 기준 팝오버(커서 위치 표시)
      async-state.tsx           # 로딩/에러/빈상태 + 새로고침 중 행 유지 래퍼
      pager.tsx                 # 공통 페이지네이션 헤더
      check-status-badge.tsx    # 상태 뱃지
      verification-*.tsx        # 품질검증 실행 화면 구성요소
      execution-detail-row.tsx
    quality-results/_components/  # 품질 결과 화면 구성요소
    data/_components/             # 통계 결과 화면 구성요소(차트/포맷 포함)
    indicators/_components/       # 지표DB 탭/표/행/툴팁 구성요소
components/
  ui/*                       # 실제 사용하는 shadcn 프리미티브만 유지(미사용분 정리됨)
  auth-guard.tsx             # 미인증 시 로그인으로 리다이렉트
hooks/
  use-api.ts                 # 데이터 조회 훅(SWR 라이트)
  use-debounced.ts           # 입력 디바운스
lib/
  api/
    generated/schema.ts      # OpenAPI에서 생성된 타입 (수정 금지, 재생성으로 갱신)
    generated/client.ts      # openapi-fetch 클라이언트 + 에러/봉투 처리
    index.ts                 # 진입점: 클라이언트 + 도메인 타입 re-export
  quality-score.ts           # 품질 점수 기준 상수
  utils.ts                   # cn() 등
```

### 5.2 컴포넌트 설계 원칙
- **페이지 파일은 최소화** — 라우트 `page.tsx`는 해당 뷰 컴포넌트를 import만 합니다.
- **헤더/사이드바는 공통 셸**(`DashboardShell`)로 분리, 레이아웃에서 한 번만 렌더.
- **카드·표·뱃지·모달 등 UI 요소는 기능별 컴포넌트**로 분리하고, 그 컴포넌트가 자체적으로 shadcn UI 프리미티브를 조합합니다(별도 UI 래퍼 레이어를 두지 않음).
- 공통 재사용물(`async-state`, `pager`, `check-status-badge`)은 대시보드 `_components`에 둡니다.

### 5.3 데이터 흐름
```
브라우저 ──(상대경로 /api/*)──▶ Next 프록시(route.ts) ──▶ BACKEND_URL (QC 서버 8081)
        ◀── 쿠키 세션 인증(credentials:'include') ──
```
- 클라이언트는 항상 같은 출처의 `/api/*`를 호출 → Next 서버 라우트가 백엔드로 전달. **CORS·쿠키 문제를 회피**합니다.
- 응답은 `{ success, code, message, data }` 봉투 → `unwrapGeneratedResult()`가 `data`만 반환하고 실패 시 `ApiError`로 변환.
- 인증 만료(401)는 `useApi`가 감지해 로그인 화면으로 보냅니다.

### 5.4 `useApi` 훅
`(data, loading, isInitialLoading, isRefetching, error, refetch)` 반환.
- 마운트/deps 변경 시 자동 조회, 언마운트 시 요청 abort.
- **페이지네이션·필터 변경 시 기존 데이터를 유지**(`isRefetching`)하여 표가 비었다가 채워지며 스크롤이 튀는 현상을 방지합니다. 화면에서는 `async-state`의 래퍼가 새로고침 중 흐림(opacity) 처리를 담당합니다.

---

## 6. API 연동 / 타입 생성

백엔드 OpenAPI 문서에서 타입을 생성합니다.

```bash
# 기본 소스: http://175.106.96.71:8081/v3/api-docs
pnpm api:gen
# 다른 백엔드로 생성하려면:
OPENAPI_URL=http://<host>:<port>/v3/api-docs pnpm api:gen
```
- 생성물 `lib/api/generated/schema.ts`는 **직접 수정하지 말 것** — 항상 재생성으로 갱신.
- 호출 예: `generatedApi.GET('/api/qc/tables', { params: { query: { page } }, signal })`.

---

## 7. 로컬 개발

```bash
pnpm install
pnpm dev          # http://localhost:3000 (백엔드 프록시는 .env.local의 BACKEND_URL)
pnpm build        # 프로덕션 빌드
pnpm start        # 빌드 결과 실행
pnpm lint         # ESLint
```

### 환경 변수
| 변수 | 위치 | 설명 |
|------|------|------|
| `BACKEND_URL` | 서버 런타임 | `/api/*` 프록시 대상 백엔드 주소 (기본 `http://175.106.96.71:8081`) |
| `OPENAPI_URL` | `api:gen` 시 | 타입 생성용 OpenAPI 문서 주소(옵션) |
| `NEXT_PUBLIC_API_BASE_URL` | 빌드/런타임 | 프록시 우회용(미설정 시 상대경로 사용 — 권장) |

`.env.local`에 `BACKEND_URL`을 설정합니다(레포에는 값 미포함).

---

## 8. 빌드 & 배포 (Docker)

```bash
docker compose up -d --build      # gukba-big 컨테이너 기동 (호스트 8887)
```
- 멀티스테이지(Dockerfile): `deps → builder(pnpm build, standalone) → runner(node server.js)`.
- compose의 `BACKEND_URL`은 기본 `host.docker.internal:8081`(컨테이너→호스트). 운영에선 실제 백엔드 주소로 주입.
- 헬스체크: 30초 간격 `GET /`.

> 서버 접속/방화벽: 운영 서버는 출발 IP 화이트리스트 기반 SSH 접근. 클라이언트 컨테이너는 서버에서 `docker compose`로 운영됩니다.

---

## 9. 알려진 제약 / 백엔드 대기 항목

현재 백엔드 OpenAPI에 **쓰기(생성/수정) 엔드포인트가 없는** 기능은 의도적으로 **조회 전용**입니다. 백엔드가 해당 API를 제공하면 UI를 활성화하면 됩니다.

- **지표 활성/비활성**: 현재 화면 표시(조회 전용, 비활성화된 체크박스). 수정하려면 백엔드에 `PATCH .../active` 류 엔드포인트 필요.
- **테이블/컬럼 추가**: 백엔드 `POST /api/qc/tables` 부재로 현재 미제공. 추가 시 모달 UI 복원 필요.
- **대시보드 품질 점수 기준**: 조회 전용(상수). 설정 변경 API 없음.

---

## 10. 참고

- 모든 화면 텍스트/도메인 용어는 한국어 운영 환경 기준입니다.
- 표는 페이지 간 컬럼 폭 일관성을 위해 `table-fixed` + 명시 폭을 사용합니다(긴 텍스트는 말줄임/줄바꿈 처리).
- shadcn `TableCell`은 기본 `whitespace-nowrap`이므로, 줄바꿈이 필요한 셀은 `whitespace-normal`을 명시합니다.
