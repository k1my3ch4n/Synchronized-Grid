# Syngrid - Synchronized Viewport Grid

> 하나의 URL을 여러 디바이스 뷰포트로 동시에 확인하고, 팀원과 실시간으로 공유하세요.

<!-- 📸 [스크린샷 1] 메인 캔버스 전체 화면 — 여러 디바이스 뷰포트(iPhone, iPad, Desktop)가 배치된 모습. 좌측 팔레트 패널 포함 -->

## 프로젝트 소개

반응형 웹 개발 시 다양한 디바이스 화면을 **동시에** 확인하고, 팀원과 **실시간으로 공유**할 수 있는 협업 도구입니다.

하나의 URL을 입력하면 여러 뷰포트에서 동시에 렌더링되며, 스크롤 동기화와 실시간 커서 공유를 지원합니다.

**Claude Code(AI)와의 페어 프로그래밍**으로 기획부터 배포까지 전 과정을 진행했습니다.

### 왜 만들었나요?

반응형 웹을 개발할 때 브라우저 크기를 일일이 바꿔가며 확인하는 것이 비효율적이었습니다. 여러 디바이스 뷰포트를 **한 화면에서 동시에** 보고, 팀원과 **같은 화면을 실시간으로 공유**하며 피드백할 수 있는 도구가 필요했습니다.

## 주요 기능

<!-- 📸 [스크린샷 2] 실시간 협업 — 2명 이상 접속 상태, 커서 표시, 뷰포트 동기화 모습 -->

- **멀티 뷰포트 캔버스** — 다양한 디바이스 크기의 뷰포트를 캔버스에 자유롭게 배치
- **실시간 협업** — Socket.IO 기반 커서 공유, 뷰포트 동기화, 스크롤 동기화
- **디바이스 프리셋** — iPhone, Galaxy, iPad, MacBook 등 13개 기기 프리셋 (카테고리별 분류)
- **드래그 & 드롭** — 뷰포트 생성, 이동, 리사이즈를 직관적으로 조작
- **HTTP 프록시** — 외부 웹사이트를 iframe에서 안전하게 로드 (URL 리라이팅 + 브릿지 스크립트)
- **워크스페이스** — Google OAuth 인증, 초대 링크(확인 페이지), 역할 기반 권한 관리
- **키보드 단축키** — Delete 삭제, Escape 선택 해제

<!-- 📸 [스크린샷 3] 드래그&드롭 — 팔레트에서 캔버스로 뷰포트를 드래그하는 모습 (실제 크기 프리뷰 표시) -->

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand |
| **Backend** | Custom Node.js Server, Socket.IO, Prisma ORM |
| **Database** | PostgreSQL (Cloud SQL) |
| **Auth** | NextAuth.js v5 (Google OAuth, JWT) |
| **Infra** | GCP Cloud Run, Docker, GitHub Actions CI/CD |
| **Testing** | Playwright E2E |
| **Architecture** | Feature-Sliced Design (FSD) |
| **AI** | Claude Code (페어 프로그래밍) |

## 아키텍처

```
Client (Next.js)
├── Canvas Editor ─── @dnd-kit 드래그&드롭, Zustand 상태 관리
├── Viewport Frame ── HTTP 프록시를 통한 외부 사이트 iframe 렌더링
├── Scroll Sync ───── postMessage 기반 크로스 오리진 스크롤 동기화
└── Real-time ─────── Socket.IO 커서 추적, 뷰포트/URL 동기화

Server (Custom Node.js)
├── HTTP Proxy ────── URL 리라이팅, 브릿지 스크립트 주입, CORS 우회
├── Socket.IO ─────── 워크스페이스 실시간 상태 동기화
├── Prisma ────────── 워크스페이스, 멤버, 초대 관리
└── NextAuth ──────── Google OAuth 인증
```

## 로컬 실행

### 사전 준비

- Node.js 20+
- Docker & Docker Compose
- Google OAuth 클라이언트 ID/Secret

### 설치

```bash
# 저장소 클론
git clone https://github.com/k1my3ch4n/Synchronized-Grid.git
cd Synchronized-Grid

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
```

`.env` 파일을 열어 아래 값을 설정하세요:

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | 기본값 그대로 사용 가능 |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32`로 생성 |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 Secret |

### 실행

```bash
# PostgreSQL 실행
docker compose up -d

# DB 마이그레이션
npx prisma migrate dev --name init

# 개발 서버 실행
npm run dev
```

`http://localhost:3000`으로 접속합니다.

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── api/                # API Routes (invite, workspaces)
│   ├── invite/             # 초대 확인 페이지
│   └── workspace/          # 워크스페이스 상세 페이지
├── features/               # Feature-Sliced Design
│   ├── canvas/             # 캔버스 (뷰포트 관리, 드래그, 선택)
│   ├── scroll-sync/        # 스크롤 동기화
│   ├── workspace/          # 워크스페이스 (실시간, 멤버 관리)
│   └── auth/               # 인증
├── entities/               # 엔티티 (viewport 프리셋)
├── widgets/                # 위젯 (header, canvas editor)
├── shared/                 # 공통 (constants, types, ui, lib)
├── server/                 # 커스텀 서버 (proxy, socket, persistence)
└── e2e/                    # Playwright E2E 테스트
```

## 배포

GitHub Actions를 통해 `main` 브랜치 푸시 시 자동 배포됩니다.

```
Push to main → Docker Build → GCP Artifact Registry → Cloud Run Deploy
```

## 링크

- **서비스**: https://syngrid.k1my3ch4n.xyz
- **GitHub**: https://github.com/k1my3ch4n/Synchronized-Grid
