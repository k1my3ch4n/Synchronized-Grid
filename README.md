# Synchronized-Grid

실시간 협업 반응형 디자인 뷰어. 여러 사용자가 동시에 뷰포트를 배치하고 웹 페이지를 미리볼 수 있습니다.

## 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand
- **Backend**: Socket.IO, NextAuth.js v5 (JWT), Prisma ORM
- **Database**: PostgreSQL (Docker)
- **Architecture**: Feature-Sliced Design (FSD)

## 로컬 실행

### 사전 준비

- Node.js 18+
- Docker & Docker Compose
- Google Cloud Console에서 OAuth 클라이언트 ID/Secret 발급

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 아래 값을 채워넣으세요:

| 변수                   | 설명                             |
| ---------------------- | -------------------------------- |
| `DATABASE_URL`         | 기본값 그대로 사용 가능          |
| `NEXTAUTH_SECRET`      | `openssl rand -base64 32`로 생성 |
| `GOOGLE_CLIENT_ID`     | Google OAuth 클라이언트 ID       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 Secret   |

### 3. PostgreSQL 실행

```bash
docker compose up -d
```

### 4. DB 마이그레이션

```bash
npx prisma migrate dev --name init
```

### 5. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000`으로 접속합니다.

## 주요 기능

- Google OAuth 로그인
- 워크스페이스 생성/관리
- 룸 생성 및 실시간 협업
- 드래그 앤 드롭 뷰포트 배치
- 뷰포트 리사이즈/이동/Z-index 실시간 동기화
- 원격 커서 추적
- URL 공유 및 동기화
