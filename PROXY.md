# Proxy Server 구조 문서

## 개요

싱긋(SynGrid)은 외부 웹사이트를 iframe으로 렌더링하여 반응형 디자인을 비교합니다.
하지만 대부분의 웹사이트는 보안 정책으로 iframe 로딩을 차단합니다.

프록시 서버는 이 문제를 해결합니다:
- **X-Frame-Options / CSP 우회** — 차단 헤더를 제거하여 모든 사이트를 iframe에 로드
- **Same-origin 전환** — 외부 콘텐츠를 자체 도메인(`/api/proxy`)으로 서빙하여 DOM/스크롤 접근 가능
- **스크롤 동기화 기반** — 프록시된 페이지에 브릿지 스크립트를 주입하여 `postMessage`로 스크롤 이벤트 전달

## 요청 흐름

```
브라우저 iframe
  │
  ├─ GET /api/proxy?url=https://example.com
  │
  ▼
server.ts (HTTP 서버)
  │  parsedUrl.pathname이 "/api/proxy"로 시작하면
  │  Next.js 대신 프록시 핸들러로 라우팅
  │
  ▼
server/proxy.ts — handleProxyRequest()
  │
  ├─ 1. URL 파라미터 추출
  ├─ 2. proxy-security.ts → SSRF 검증 (DNS 조회 + 내부 IP 차단)
  ├─ 3. fetch()로 원격 콘텐츠 가져오기
  ├─ 4. 차단 헤더 제거 (x-frame-options, CSP)
  ├─ 5. Content-Type별 분기:
  │     ├─ text/html  → URL 재작성 + 브릿지 스크립트 주입
  │     ├─ text/css   → url() 참조 재작성
  │     └─ 기타       → 스트리밍 패스스루
  └─ 6. 클라이언트에 응답
```

## 파일 구조

```
server/
├── proxy-constants.ts      # 설정 상수
├── proxy-security.ts       # SSRF 방지 (URL 검증)
├── proxy-url-rewriter.ts   # HTML/CSS URL 재작성 + 브릿지 스크립트
└── proxy.ts                # 메인 핸들러 (오케스트레이션)
```

## 각 모듈 상세

### proxy-constants.ts

프록시 동작에 필요한 상수를 정의합니다.

| 상수 | 값 | 설명 |
|------|----|------|
| `PROXY_PATH` | `"/api/proxy"` | 프록시 엔드포인트 경로 |
| `PROXY_TIMEOUT` | `10,000ms` | fetch 타임아웃 |
| `MAX_RESPONSE_SIZE` | `50MB` | 응답 크기 제한 |
| `BLOCKED_RESPONSE_HEADERS` | x-frame-options, CSP | 제거할 보안 헤더 |
| `PASS_THROUGH_HEADERS` | content-type, cache-control 등 | 클라이언트에 전달할 헤더 |
| `BROWSER_USER_AGENT` | Chrome UA 문자열 | 일부 사이트의 봇 차단 우회 |

### proxy-security.ts

SSRF(Server-Side Request Forgery) 공격을 방지합니다.

**`validateProxyUrl(raw: string): Promise<URL | null>`**

1. URL 파싱 — 유효하지 않으면 `null`
2. 프로토콜 검사 — `http:` 또는 `https:`만 허용
3. 호스트명 검사 — `localhost` 차단
4. DNS 조회 — `dns.promises.lookup()`으로 실제 IP 확인
5. 내부 IP 차단:
   - `127.x.x.x` (루프백)
   - `10.x.x.x` (클래스 A 사설)
   - `172.16-31.x.x` (클래스 B 사설)
   - `192.168.x.x` (클래스 C 사설)
   - `169.254.x.x` (링크 로컬)
   - `::1`, `fc00:`, `fd00:`, `fe80:` (IPv6 사설/로컬)

### proxy-url-rewriter.ts

HTML과 CSS 내의 URL을 프록시 경로로 재작성합니다.

#### URL 재작성 규칙

```
원본 URL                          → 변환 결과
─────────────────────────────────────────────────────
data:, blob:, javascript:, #      → 변환 안 함 (스킵)
//cdn.example.com/style.css       → /api/proxy?url=https://cdn.example.com/style.css
https://example.com/img.png       → /api/proxy?url=https://example.com/img.png
/assets/logo.svg                  → /api/proxy?url=https://example.com/assets/logo.svg
./main.js                         → /api/proxy?url=https://example.com/page/main.js
```

#### 재작성 대상

| 대상 | 정규식 패턴 | 설명 |
|------|-------------|------|
| HTML 속성 | `src`, `href`, `action`, `poster` | 큰따옴표/작은따옴표 모두 처리 |
| srcset | `srcset="url 2x, url 3x"` | 쉼표 구분 각 URL 개별 재작성 |
| 인라인 스타일 | `style="background: url(...)"` | `url()` 참조 재작성 |
| `<style>` 태그 | `<style>` 내부 CSS | `url()` 참조 재작성 |
| CSS 파일 | 별도 `rewriteCss()` 함수 | CSS 파일 전체의 `url()` 재작성 |

#### 안전망: `<base>` 태그

정규식이 놓칠 수 있는 URL(JS 동적 생성 등)을 위해 `<head>` 뒤에 삽입:
```html
<base href="https://example.com/">
```
브라우저가 상대 경로를 원본 도메인 기준으로 해석하도록 합니다.

#### 브릿지 스크립트

`</head>` 앞에 주입되어 부모 프레임과 통신합니다:

```js
// 스크롤 이벤트 → 부모에 postMessage
window.addEventListener('scroll', () => {
  window.parent.postMessage({
    type: 'proxy:scroll',
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight
  }, '*');
});

// 콘텐츠 크기 변경 감지
new ResizeObserver(() => {
  window.parent.postMessage({
    type: 'proxy:resize',
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight
  }, '*');
}).observe(document.documentElement);
```

향후 스크롤 동기화 구현 시 부모 페이지에서 `message` 이벤트를 수신하여 활용합니다.

### proxy.ts

메인 핸들러로 위 모듈들을 조합합니다.

**`handleProxyRequest(req, res): Promise<void>`**

#### Content-Type별 처리

| Content-Type | 처리 방식 | 이유 |
|-------------|-----------|------|
| `text/html` | 전체 읽기 → `rewriteHtml()` → 응답 | URL 재작성 + 스크립트 주입 필요 |
| `text/css` | 전체 읽기 → `rewriteCss()` → 응답 | `url()` 참조 재작성 필요 |
| 기타 (JS, 이미지, 폰트 등) | `Readable.fromWeb().pipe(res)` 스트리밍 | 변환 불필요, 메모리 효율 |

#### 헤더 처리

- **제거**: `x-frame-options`, `content-security-policy` — iframe 로딩 차단 방지
- **추가**: `x-frame-options: ALLOWALL`, `access-control-allow-origin: *`
- **전달**: `content-type`, `cache-control`, `etag`, `last-modified` — 브라우저 캐시 활용
- **삭제**: `content-length` (HTML/CSS 재작성 시 크기 변경)

#### 에러 응답

| 상태 코드 | 조건 |
|-----------|------|
| `400` | url 파라미터 누락 또는 유효하지 않은 URL |
| `413` | 응답 크기 50MB 초과 |
| `502` | fetch 실패 (네트워크 오류, DNS 실패) |
| `504` | fetch 타임아웃 (10초 초과) |

## 클라이언트 연동

### ViewportFrame.tsx

```tsx
// 변경 전: 직접 URL 로딩 (CORS/CSP 차단)
<iframe src={url} />

// 변경 후: 프록시 경유 (same-origin)
<iframe src={`/api/proxy?url=${encodeURIComponent(url)}`} />
```

### server.ts

```ts
// Next.js 핸들러 전에 프록시 경로 인터셉트
if (parsedUrl.pathname?.startsWith(PROXY_PATH)) {
  await handleProxyRequest(req, res);
  return;
}
```

## 제약사항

| 제약 | 설명 | 보완 |
|------|------|------|
| 정규식 기반 재작성 | JS 동적 생성 URL은 재작성 불가 | `<base>` 태그로 일부 보완 |
| SPA 제한 | CSR 앱의 API 호출은 원본 서버로 가서 CORS 에러 가능 | 정적 사이트/SSR에 적합 |
| 쿠키 미전달 | 보안상 의도적으로 쿠키를 전달하지 않음 | 인증 필요 사이트는 비로그인 상태로 표시 |
| WebSocket 미지원 | 타겟 사이트의 WS 연결은 프록시되지 않음 | 디자인 프리뷰 목적에는 충분 |
| 외부 의존성 없음 | Node.js 내장 모듈만 사용 (http, url, dns, stream) | — |

## 향후 확장

- **스크롤 동기화**: 브릿지 스크립트의 `proxy:scroll` 이벤트를 수신하여 뷰포트 간 스크롤 연동
- **Service Worker 주입**: 프록시된 페이지에 SW를 등록하여 동적 fetch/XHR도 프록시 경유
- **서버 사이드 캐시**: 자주 요청되는 리소스를 인메모리 LRU 캐시로 성능 개선
