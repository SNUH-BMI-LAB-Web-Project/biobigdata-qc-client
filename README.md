# BIKO-DQM — 의학 바이오 빅데이터 품질관리 대시보드 (웹 클라이언트)

> 이 문서는 **이 프로젝트와 도메인을 처음 접하는 사람**이 전체 그림을 빠르게 잡을 수 있도록 작성한 인수인계 문서입니다.
> "무엇을 하는 서비스인지 → 어떤 기술로 만들었는지 → 폴더 구조 → 실행·배포 방법" 순서로 읽으면 됩니다.

---

## 1. 이 프로젝트는 무엇인가

병원의 의학 데이터는 여러 단계의 데이터베이스(DB)를 거치며 정리·통합·개방됩니다. 각 단계의 데이터가 **정해진 품질 기준**(예: 필수값 누락 여부, 형식·코드 유효성)과 **통계 분포**(데이터가 정상 범위인지)를 만족하는지 검증해야 합니다.

**BIKO-DQM 대시보드**는 이 검증을 다루는 **운영자용 웹 화면**입니다.
- 검증을 **실행**시키고,
- 검증 **결과를 표·차트로** 보여주고,
- 검증에 쓰이는 **지표·테이블 정의를 조회·관리**합니다.

이 저장소는 그중 **프런트엔드(화면)** 입니다. 실제 검증 로직과 데이터는 별도의 **백엔드 QC 서버**와 **Airflow**가 처리하고, 이 웹은 백엔드 API를 호출해 결과를 받아 표시합니다.

| 구분 | 내용 |
|------|------|
| 제품명 | BIKO-DQM (품질관리 대시보드) |
| 형태 | 사내 운영자용 웹 대시보드 (로그인 필요) |
| 사용자 | 관리자(ADMIN) / 매니저(MANAGER) / 뷰어(VIEWER) |
| 백엔드 | 별도 QC 서버(REST API, OpenAPI 문서 제공) — 기본 `http://175.106.96.71:8081` |
| 배포 | NCP(네이버 클라우드) 서버에서 Docker로 구동 (웹 컨테이너 포트 8887) |

---

## 2. 도메인 용어 정리

이 분야를 처음 보는 사람을 위해 화면 곳곳에 나오는 용어를 정리합니다.

### 2.1 DB 단계 (stage)
데이터가 흐르는 순서대로의 저장소 구분입니다.

| 코드 | 한글명 | 설명 |
|------|--------|------|
| `LINK` | 연계DB | 원천 데이터를 연계해 받는 저장소 |
| `COLL` | 수집DB | 수집 단계 (화면에는 노출하지 않음) |
| `PREP` | 전처리DB | 정제·전처리 저장소 |
| `INTG` | 통합DB | 통합 저장소 |
| `OPEN` | 개방DB | 외부 개방용 저장소 |

- 전처리/통합/개방 단계는 **사전 개방(preview_open) / 본 개방(main_open)** 으로 한 번 더 나뉩니다. (연계DB는 구분 없음)

### 2.2 지표(검사 항목) 유형
- **품질지표 (quality)** — 완전성/정합성/타당성 같은 "규칙 검사". 단계별 통과율(점수)로 표현.
- **통계지표 (achilles)** — OHDSI **Achilles** 분석 기반의 분포·카운트 통계.

### 2.3 검증 상태 (check_status)
`0` 진행중 · `1` 완료 · `2` 오류 · `3` 중단

### 2.4 품질 점수 색상 기준 (조회 전용)
우수 **95점 이상**(녹색) · 양호 **85~94점**(노랑) · 보통 **75점 미만**(빨강). (값: `lib/quality-score.ts`)

---

## 3. 화면(페이지)별 기능

| 경로(URL) | 화면 | 설명 |
|-----------|------|------|
| `/` | 로그인 | 세션 로그인 |
| `/signup` | 회원가입 | 가입 신청 → 관리자 승인 |
| `/dashboard` | **품질검증 실행** | 검증 대상(DB·서브단계·지표유형) 선택 → 검증 실행(백엔드가 Airflow DAG 트리거). 하단 **검증 현황** 표(행 클릭 시 단계별 상세) |
| `/dashboard/quality-results` | **데이터 품질 결과** | 단계별 점수 카드 → 검증 실행 내역(5건/페이지) → 선택 시 지표별 통과율 |
| `/dashboard/data` | **데이터 통계 결과** | DB별 검증 건수 카드 → 통계 검증 내역 → 선택 시 단순값/분포(차트+표) |
| `/dashboard/indicators` | **지표DB 관리** | 탭 3개: 테이블 목록 / 품질지표 / 통계지표 (검색·페이징) |
| `/dashboard/indicators/[id]` | 품질지표 상세 | 지표 정보·단계별 통과율·적용 대상 테이블/컬럼 |

공통 화면 틀: 상단 **헤더**(로고·사용자명·로그아웃) + 좌측 **사이드바**(내비 + "품질 점수 기준" 팝오버). 헤더의 사용자명을 누르면 **계정 모달**(정보·비밀번호 변경·회원탈퇴).

---

## 4. 기술 스택 & 사용 라이브러리 (버전 포함)

### 4.1 한눈에
- **언어/런타임**: TypeScript, Node.js 22 (Alpine), 패키지 매니저 **pnpm 10.30.1**
- **프레임워크**: Next.js(App Router) + React
- **스타일**: Tailwind CSS v4 + shadcn 스타일 UI(Radix 기반)
- **API 통신**: openapi-fetch (백엔드 OpenAPI 스펙에서 타입 자동 생성)

### 4.2 핵심 의존성 (dependencies)
| 라이브러리 | 버전 | 역할 |
|------------|------|------|
| `next` | 16.1.6 | 웹 프레임워크. 페이지 라우팅·서버 렌더링·API 프록시 |
| `react` / `react-dom` | 19.2.4 | 화면 UI 렌더링 핵심 라이브러리 |
| `typescript` | 5.7.3 | 정적 타입(오류를 빌드 전에 잡음) |
| `openapi-fetch` | ^0.17.0 | 백엔드 API를 **타입 안전**하게 호출하는 클라이언트 |
| `recharts` | 2.15.0 | 통계 결과 **막대/분포 차트** |
| `lucide-react` | ^0.564.0 | 아이콘 세트 |
| `clsx` + `tailwind-merge` | ^2.1.1 / ^3.3.1 | className 조합 유틸(`cn()`의 재료) |
| `class-variance-authority` | ^0.7.1 | 버튼/뱃지 variant(스타일 변형) 정의 |
| `@radix-ui/react-*` | (아래) | 접근성 보장 UI 기본 부품(다이얼로그·셀렉트 등) |
| `@vercel/analytics` | 1.6.1 | 방문 분석(선택) |

**Radix UI 부품(버전)** — shadcn UI가 내부적으로 쓰는 접근성 컴포넌트:
`@radix-ui/react-dialog 1.1.15`, `@radix-ui/react-alert-dialog 1.1.15`, `@radix-ui/react-select 2.2.6`, `@radix-ui/react-tabs 1.1.13`, `@radix-ui/react-tooltip 1.2.8`, `@radix-ui/react-checkbox 1.3.3`, `@radix-ui/react-label 2.1.8`, `@radix-ui/react-slot 1.2.4`
> progress/스피너 등 한 곳에서만 쓰는 단발성 UI는 라이브러리 대신 직접 구현해 의존성을 줄였습니다.

### 4.3 개발 의존성 (devDependencies)
| 라이브러리 | 버전 | 역할 |
|------------|------|------|
| `tailwindcss` + `@tailwindcss/postcss` | ^4.1.9 / ^4.1.13 | CSS 프레임워크(v4) |
| `tw-animate-css` | 1.3.3 | Tailwind 애니메이션 유틸 |
| `postcss` | ^8.5 | CSS 빌드 파이프라인 |
| `eslint` + `eslint-config-next` | ^9.39.4 / ^16.2.9 | 코드 린트 |
| `openapi-typescript` | ^7.13.0 | 백엔드 OpenAPI → TS 타입 **생성기** (`pnpm api:gen`) |
| `@types/*` | — | 타입 정의 |

---

## 5. 프로젝트 구조

### 5.1 컴포넌트를 어디에 두는가 (배치 규칙)
- **여러 페이지에서 재사용** → 공통 폴더 **`components/`**
- **한 페이지에서만 사용** → 그 페이지 폴더의 **`_components/`**
- 화면 요소는 **카드는 카드, 표는 표, 폼은 폼**처럼 잘게 나눕니다. (한 페이지를 거대한 한 덩어리로 만들지 않음)
- 별도 UI 래퍼 파일을 늘리지 않습니다. **여러 곳에서 공유하는 기본 UI만 `components/ui/`** 에 두고, 한 곳에서만 쓰는 UI는 그 컴포넌트 안에 직접 작성합니다.
- 모든 `page.tsx`는 해당 **뷰 컴포넌트를 import만** 합니다(페이지 파일에 로직/마크업을 직접 두지 않음).

### 5.2 폴더 트리
```
app/                                  # Next.js App Router (페이지 = 폴더)
  layout.tsx                          # 전체 공통 레이아웃(폰트/메타)
  page.tsx                            # 로그인 → LoginView import만
  _components/login-view.tsx          # ▷ 로그인 화면(폼+상태)
  signup/
    page.tsx                          # 회원가입 → SignupView import만
    _components/                      # ▷ '회원가입' 페이지 전용
      signup-view.tsx                   # 폼/완료 화면 전환
      signup-form.tsx                   # 입력 폼(ID 중복확인·유효성·가입)
      signup-success.tsx               # 가입 신청 완료 화면
  api/[...path]/route.ts              # ★ 백엔드 프록시(서버 코드) — app 안에 있어야 동작(Next 규칙)
  dashboard/
    layout.tsx                        # 로그인 가드 + 공통 셸만 적용(아주 짧음)
    page.tsx                          # 품질검증 실행 → 뷰 컴포넌트 import만
    _components/                      # ▷ '품질검증 실행' 페이지 전용
      quality-verification-view.tsx     # 상태 관리(오케스트레이션)
      verification-selection-panel.tsx  # 검증 대상 선택 패널 + 실행 버튼
      verification-history-card.tsx     # 검증 현황 표(카드)
      execution-detail-row.tsx          # 행 펼침 상세
      verification-config.ts            # DB/서브단계/지표유형 상수
    quality-results/_components/      # ▷ '데이터 품질 결과' 페이지 전용
      quality-results-view.tsx          # 상태 관리
      stage-summary-cards.tsx           # 단계별 점수 카드
      checks-table.tsx                  # 검증 실행 내역 표
      metric-results.tsx                # 지표별 결과 목록
      metric-result-card.tsx            # 지표 1건 카드
      quality-result-utils.ts           # 점수 색/포맷 헬퍼
    data/_components/                 # ▷ '데이터 통계 결과' 페이지 전용
      data-statistics-result-view.tsx   # 상태 관리
      db-count-cards.tsx                # DB별 검증 건수 카드
      statistics-history-table.tsx      # 통계 검증 내역 표
      statistics-results.tsx            # 단순값/분포 묶음
      distribution-results.tsx          # 분포 차트 + 표
      statistics-format.ts              # 숫자/날짜 포맷
    indicators/_components/           # ▷ '지표DB 관리' 페이지 전용
      indicators-view.tsx               # 탭 컨테이너
      tables-tab.tsx                    # 테이블 목록 탭
      quality-metrics-tab.tsx           # 품질지표 탭
      stats-tab.tsx                     # 통계지표 탭
      table-row-group.tsx               # 테이블 행(+ 펼침 시 컬럼)
      fields-panel.tsx                  # 컬럼 목록 패널
      required-info-tooltip.tsx         # '필수여부' 안내 툴팁
      indicator-utils.ts                # Y/N·등급 등 헬퍼
    indicators/[id]/_components/      # ▷ '지표 상세' 페이지 전용
      indicator-detail-view.tsx         # 상세 조회 + 로딩/에러 + 조합
      metric-summary-header.tsx         # 상단 헤더 카드
      metric-info-cards.tsx             # 지표 정보 + 단계별 통과율
      applied-fields-table.tsx          # 적용 대상 테이블/컬럼 표(필터·정렬·페이징)
      detail-utils.ts                   # 활성판정·점수색 헬퍼
components/                           # ▷ 여러 페이지 공통(재사용)
  layout/                               # 화면 틀(공통)
    dashboard-shell.tsx                   # 헤더+사이드바+계정모달 조합, 로그인/로그아웃
    dashboard-header.tsx                  # 상단 헤더
    dashboard-sidebar.tsx                 # 좌측 사이드바(내비 + 점수 팝오버)
    account-dialog.tsx                    # 계정 모달(비밀번호 변경/회원탈퇴)
    quality-score-popover.tsx             # 품질 점수 기준 팝오버
    auth-layout.tsx                       # 로그인·회원가입 공통 레이아웃(브랜드 헤더)
  async-state.tsx                       # 로딩/에러/빈상태 + '새로고침 중 행 유지' 래퍼
  pager.tsx                             # 페이지네이션(컴팩트/헤더형)
  check-status-badge.tsx                # 검증 상태 뱃지
  auth-guard.tsx                        # 미로그인 시 로그인으로 보냄
  ui/                                   # 공유 UI 기본 부품(여러 곳에서 쓰는 것만)
    badge · button · card · checkbox · input · label · select · table
hooks/
  use-api.ts                          # 데이터 조회 훅(로딩/새로고침/에러 상태 관리)
  use-debounced.ts                    # 입력 디바운스(검색창 타이핑 최적화)
lib/
  api/
    generated/schema.ts               # ★ OpenAPI에서 자동 생성된 타입 (직접 수정 금지)
    generated/client.ts               # openapi-fetch 클라이언트 + 에러/응답 봉투 처리
    index.ts                          # 외부 노출 진입점(클라이언트 + 도메인 타입)
  quality-score.ts                    # 품질 점수 기준 상수
  utils.ts                            # cn() 등 공용 유틸
```

### 5.3 데이터가 흐르는 방식 (요청 → 응답)
```
브라우저 ──(상대경로 /api/*)──▶ Next 프록시(app/api/[...path]/route.ts) ──▶ 백엔드(QC 서버)
        ◀──────── 쿠키 세션 인증(credentials: 'include') ────────
```
- 브라우저는 항상 같은 주소의 `/api/*`만 부르고, Next 서버가 백엔드로 전달합니다 → **CORS·쿠키 문제를 피함**.
- 응답은 `{ success, code, message, data }` 형태로 오고, `unwrapGeneratedResult()`가 `data`만 꺼내 줍니다. 실패 시 `ApiError`로 변환.
- 로그인 만료(401)는 `useApi` 훅이 감지해 로그인 화면으로 보냅니다.

### 5.4 목록 화면 공통 동작 (`useApi` + `async-state`)
- `useApi(fetcher, deps)`는 `{ data, isInitialLoading, isRefetching, error, refetch }`를 돌려줍니다.
- 페이지/필터를 바꿔 다시 불러올 때는 **기존 행을 유지한 채 살짝 흐리게(`isRefetching`)** 처리해, 표가 비었다 채워지며 스크롤이 튀는 현상을 막습니다.

---

## 6. API 타입 생성 (백엔드 스펙 → 코드)

```bash
pnpm api:gen
# 기본 소스: http://175.106.96.71:8081/v3/api-docs
# 다른 백엔드: OPENAPI_URL=http://<host>:<port>/v3/api-docs pnpm api:gen
```
- 결과 파일 `lib/api/generated/schema.ts`는 **직접 수정하지 말고** 재생성으로만 갱신합니다.
- 호출 예: `generatedApi.GET('/api/qc/tables', { params: { query: { page } }, signal })`

---

## 7. 로컬 개발

```bash
pnpm install      # 의존성 설치
pnpm dev          # 개발 서버 http://localhost:3000
pnpm build        # 프로덕션 빌드
pnpm start        # 빌드 결과 실행
pnpm lint         # 린트
```

### 환경 변수
| 변수 | 위치 | 설명 |
|------|------|------|
| `BACKEND_URL` | 서버 런타임 | `/api/*` 프록시 대상 백엔드 주소 (기본 `http://175.106.96.71:8081`) |
| `OPENAPI_URL` | `api:gen` 시 | 타입 생성용 OpenAPI 문서 주소(옵션) |
| `NEXT_PUBLIC_API_BASE_URL` | 빌드/런타임 | 프록시 우회용(미설정 권장) |

`.env.local`에 `BACKEND_URL`을 둡니다(레포에 값은 미포함).

---

## 8. 인프라 & 배포 (NCP)

### 8.1 운영 구성 — NCP 서버 1대에서 Docker Compose로 전체 스택 구동
| 컨테이너 | 역할 | 포트(호스트→컨테이너) |
|----------|------|----------------------|
| `gukba-big` | **이 웹 클라이언트** (Next standalone) | 8887 → 3000 |
| `biobigdata-qc-server` | 백엔드 QC 서버(REST/OpenAPI) | 8081 → 8080 |
| `airflow-apiserver` 외 (scheduler/worker/triggerer/dag-processor) | Airflow 검증 실행 엔진 | 8080 등 |
| `airflow-postgres` / `airflow-redis` | Airflow 메타DB / 브로커 | 내부 |
| `mysql` / `cdm-postgres` / `qc_metrics-postgres` / `biko-oracle` | 데이터/메타 저장소 | 3306 / 5532 / 5533 / 25029 |
| `cloudbeaver` | DB 관리 콘솔 | 8978 |

흐름: **웹 → (Next 프록시) → QC 서버 → Airflow**. 모두 같은 NCP 호스트에 떠 있습니다.

### 8.2 Airflow / DAG (검증 실행의 실체)
- "품질검증 실행"은 백엔드에 `POST /api/qc/quality-metrics`(품질)·`POST /api/qc/statistics-metrics`(통계)를 보내고, 백엔드가 **Airflow DAG를 트리거**합니다.
- DAG가 단계별 검증/통계를 수행하고 결과를 DB에 적재 → 결과 화면에서 조회. 검증 상태는 DAG 실행 상태를 반영합니다.
- **DAG ID가 바뀌면** 백엔드의 트리거 설정(환경변수)도 함께 바꿔야 합니다. (웹은 DAG ID를 직접 모르고 백엔드 엔드포인트만 호출)

### 8.3 배포 절차
> **허용된(화이트리스트) IP에서만** SSH·배포가 됩니다. 사번/공개키 등록 후 화이트리스트에 IP가 올라가야 접속되며, IP가 바뀌면 재등록이 필요합니다.

```bash
# 1) 허용 IP에서 운영 서버 SSH 접속
ssh <user>@<ncp-host>

# 2) 최신 소스 반영
cd <배포경로>/biobigdata-qc-client
git pull

# 3) 웹 컨테이너 재빌드·기동
docker compose up -d --build web      # 이미지 gukba-big:latest

# 4) 확인
docker compose ps                      # healthy 확인
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8887/   # 200 기대
```
- Dockerfile: 멀티스테이지 `deps → builder(pnpm build, standalone) → runner(node server.js)`, 베이스 `node:22-alpine`.
- 빌드 시 `pnpm install --frozen-lockfile` 사용 → **`package.json`을 바꾸면 `pnpm-lock.yaml`도 같이 커밋**해야 빌드가 깨지지 않습니다.
- `.dockerignore`가 `*.md`, `CLAUDE.md`, `.claude` 등을 제외하므로 **문서·CLAUDE.md는 배포 이미지에 포함되지 않습니다.**

---

## 9. 알려진 제약 / 백엔드 대기 항목

백엔드 OpenAPI에 **쓰기(생성/수정) 엔드포인트가 없는** 기능은 의도적으로 **조회 전용**입니다.
- **지표 활성/비활성**: 현재 표시만(비활성 체크박스). 수정하려면 백엔드에 `PATCH .../active` 류 필요.
- **테이블/컬럼 추가**: 백엔드 `POST /api/qc/tables` 부재로 미제공.
- **대시보드 품질 점수 기준**: 조회 전용 상수.

백엔드가 해당 API를 추가하면 `pnpm api:gen` 후 UI를 활성화하면 됩니다.

---

## 10. 코딩 관례 (유지보수 시 주의)

- 화면 텍스트/도메인 용어는 한국어 운영 환경 기준.
- 표는 페이지 간 컬럼 폭 일관성을 위해 `table-fixed` + 명시 폭. 긴 텍스트는 말줄임/줄바꿈.
- shadcn `TableCell`은 기본 `whitespace-nowrap`이라, 줄바꿈이 필요한 셀은 `whitespace-normal`을 명시.
- 번호 컬럼은 가운데, 그 외 데이터/뱃지 컬럼은 좌측 정렬로 통일.
- 라벨/상수는 `@/lib/api`(STAGE_LABEL 등), `@/lib/quality-score`에 모아두고 복붙하지 않음.
