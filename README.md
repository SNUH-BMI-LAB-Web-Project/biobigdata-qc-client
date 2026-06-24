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

### 5.1 디렉터리 구조 (컴포넌트 배치 규칙: **여러 페이지 재사용 → `components/`**, **단일 페이지 전용 → 해당 라우트 `_components/`**)
```
app/
  layout.tsx                 # 루트 레이아웃
  page.tsx                   # 로그인
  signup/page.tsx            # 회원가입
  api/[...path]/route.ts     # 백엔드 프록시(서버)
  dashboard/
    layout.tsx               # AuthGuard + DashboardShell (최소)
    page.tsx                 # 뷰 컴포넌트만 import (최소화)
    _components/             # ▷ 대시보드(품질검증 실행) 단일 페이지 전용
      quality-verification-view.tsx   # 화면 오케스트레이션(상태)
      verification-selection-panel.tsx# 검증 대상 선택 패널 + 실행 버튼
      verification-history-card.tsx   # 검증 현황 표(카드)
      execution-detail-row.tsx        # 행 펼침 상세
      verification-config.ts          # DB/서브단계/지표유형 상수
    quality-results/_components/      # ▷ 데이터 품질 결과 전용
      quality-results-view.tsx        # 오케스트레이션(상태)
      stage-summary-cards.tsx         # 단계별 점수 카드
      checks-table.tsx                # 검증 실행 내역 표
      metric-results.tsx              # 지표별 결과 목록
      metric-result-card.tsx          # 지표 1건 카드
      quality-result-utils.ts         # 점수색/포맷 헬퍼
    data/_components/                 # ▷ 데이터 통계 결과 전용
      data-statistics-result-view.tsx # 오케스트레이션(상태)
      db-count-cards.tsx              # DB별 검증 건수 카드
      statistics-history-table.tsx    # 통계 검증 실행 내역 표
      statistics-results.tsx          # 단순값/분포 결과
      distribution-results.tsx        # 분포 차트+표
      statistics-format.ts            # 숫자/날짜 포맷
    indicators/_components/           # ▷ 지표DB 관리 전용
      indicators-view.tsx             # 탭 컨테이너
      tables-tab.tsx / quality-metrics-tab.tsx / stats-tab.tsx
      table-row-group.tsx / fields-panel.tsx / required-info-tooltip.tsx
      indicator-utils.ts
components/                  # ▷ 여러 페이지 공통(재사용)
  layout/                       # 레이아웃 chrome (모든 대시보드 페이지 공통)
    dashboard-shell.tsx           # 헤더+사이드바+계정모달 조합, 로그인/로그아웃
    dashboard-header.tsx          # 헤더(로고·계정·로그아웃)
    dashboard-sidebar.tsx         # 사이드바(내비 + 점수 팝오버)
    account-dialog.tsx            # 계정 모달(비밀번호 변경/회원탈퇴)
    quality-score-popover.tsx     # 품질 점수 기준 팝오버(커서 위치 표시)
  async-state.tsx             # 로딩/에러/빈상태 + 새로고침 중 행 유지 래퍼
  pager.tsx                   # 공통 페이지네이션(헤더/컴팩트)
  check-status-badge.tsx      # 검증 상태 뱃지
  auth-guard.tsx              # 미인증 시 로그인으로 리다이렉트
  ui/*                        # shadcn 프리미티브(공유 디자인 시스템, 실사용분만 유지)
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
- **페이지 파일은 최소화** — 라우트 `page.tsx`는 해당 뷰 컴포넌트를 import만 한다.
- **배치 기준** — 여러 페이지에서 재사용하면 **공통 `components/`**, 한 페이지에서만 쓰면 **그 라우트의 `_components/`**.
- **헤더·사이드바는 공통 컴포넌트**(`components/layout/`)로 분리하고 셸이 조합한다.
- **카드는 카드, 표는 표, 모달은 모달**처럼 화면 요소 단위로 잘게 나눈다. 한 페이지 기능을 하나의 거대 컴포넌트로 뭉치지 않는다(뷰 컴포넌트는 상태 오케스트레이션만 담당).
- **별도 UI 래퍼 레이어를 새로 만들지 않는다.** 기능 컴포넌트가 `components/ui/*`(공유 디자인 시스템) 프리미티브를 직접 조합한다.

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

## 8. 인프라 & 배포 (NCP)

### 8.1 운영 환경 구성
운영은 **NCP(Naver Cloud Platform) 서버 1대**에서 **Docker Compose**로 전체 스택을 구동합니다. (단일 호스트, 컨테이너 네트워크로 상호 통신)

| 컨테이너 | 역할 | 포트(호스트→컨테이너) |
|----------|------|----------------------|
| `gukba-big` | **이 프로젝트(웹 클라이언트, Next standalone)** | 8887 → 3000 |
| `biobigdata-qc-server` | 백엔드 QC 서버(REST/OpenAPI) | 8081 → 8080 |
| `airflow-apiserver` | Airflow REST API | 8080 |
| `airflow-scheduler` / `worker` / `triggerer` / `dag-processor` | Airflow 실행 엔진 | (내부) |
| `airflow-postgres` / `airflow-redis` | Airflow 메타DB / 브로커 | (내부) |
| `mysql` / `cdm-postgres` / `qc_metrics-postgres` / `biko-oracle` | 도메인 데이터/메타 저장소 | 3306 / 5532 / 5533 / 25029 |
| `cloudbeaver` | DB 관리 콘솔 | 8978 |

> 즉 **웹 → (Next 프록시) → QC 서버 → Airflow** 순으로 연결되며, 모두 같은 NCP 호스트에 떠 있습니다.

### 8.2 Airflow / DAG (검증 실행의 실체)
- 화면의 **"품질검증 실행"** 은 백엔드에 `POST /api/qc/quality-metrics`(품질) · `POST /api/qc/statistics-metrics`(통계)를 보내고, 백엔드가 **Airflow DAG를 트리거**합니다.
- DAG가 단계(stage)·서브단계별로 검증/통계 작업을 수행하고 결과를 DB에 적재 → 화면의 **품질/통계 결과**에서 조회합니다.
- 검증 상태(`check_status`)는 DAG 실행 상태(진행중/완료/오류/중단)를 반영합니다.
- **DAG ID가 바뀌면** 백엔드의 DAG 트리거 대상(환경변수/설정)을 함께 갱신해야 합니다. (웹 클라이언트는 DAG ID를 직접 알지 못하고 백엔드 엔드포인트만 호출)

### 8.3 배포 절차 (NCP 서버에서)
운영 서버는 **출발지 IP 화이트리스트**가 적용돼, **허용된 IP에서만** SSH 접속·배포 작업이 가능합니다. (사번/공개키 등록 후 화이트리스트에 IP가 등록돼야 접속됨 — IP가 바뀌면 재등록 필요)

```bash
# 1) 허용된 IP에서 운영 서버 SSH 접속
ssh <user>@<ncp-host>          # 예: ssh biko-qms

# 2) 최신 소스 반영
cd <배포 경로>/biobigdata-qc-client
git pull

# 3) 클라이언트 컨테이너만 재빌드·기동 (전체 스택 중 web 서비스)
docker compose up -d --build web   # 또는 docker compose up -d --build

# 4) 상태 확인
docker compose ps
docker compose logs -f web
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8887/   # 200 기대
```
- 이미지: `gukba-big:latest` (멀티스테이지 `deps → builder(pnpm build, standalone) → runner(node server.js)`).
- `BACKEND_URL`은 compose 환경변수로 주입 — 같은 호스트의 QC 서버를 가리킴(기본 `host.docker.internal:8081`).
- 헬스체크: 30초 간격 `GET /`. `docker compose ps`에서 `healthy` 확인.
- 롤백: 직전 커밋으로 `git checkout <sha>` 후 재빌드, 또는 이전 이미지 태그로 교체.

> ⚠️ **허용 IP에서만 작업 가능**: SSH·배포·서버 점검은 화이트리스트에 등록된 IP에서만 됩니다. 재택/외부망 등 IP가 바뀌면 먼저 IP 재등록을 요청해야 합니다.

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
- **UI 최소화 원칙**: `components/ui/*`에는 **여러 곳에서 공유되는 프리미티브만** 둡니다(badge·button·card·checkbox·input·label·select·table). 한 곳에서만 쓰는 UI(progress·spinner·empty·tabs·tooltip·dialog·alert-dialog 등)는 별도 파일로 빼지 않고 **소비 컴포넌트 안에 인라인**(필요 시 `@radix-ui/*`를 직접 구성)합니다.
