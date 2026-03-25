# Proxy Server 디버깅 기록

프록시 서버가 외부 웹사이트를 iframe에 올바르게 렌더링하기까지 거친 3번의 주요 반복(iteration)과 각 단계에서 발생한 문제·해결 과정을 기록합니다.

---

## 반복 1: 전체 정규식 URL 재작성

### 접근 방식

HTML 내 모든 URL을 정규식으로 탐색하여 `/api/proxy?url=...` 형태로 재작성합니다.

```
src="https://example.com/img.png"
→ src="/api/proxy?url=https%3A%2F%2Fexample.com%2Fimg.png"
```

대상: `src`, `href`, `action`, `poster`, `srcset`, `style url()`, `<style> url()`

### 발생한 문제: 원본과 다른 화면 렌더링

정규식이 `<script>` 태그 내부의 JavaScript 코드까지 치환했습니다.

```html
<!-- 원본 -->
<script>
  var config = { api: "https://example.com/api" };
  el.src = "/assets/icon.svg";
</script>

<!-- 재작성 후 (깨진 코드) -->
<script>
  var config = { api: "/api/proxy?url=https%3A%2F%2Fexample.com%2Fapi" };
  el.src = "/api/proxy?url=https%3A%2F%2Fexample.com%2Fassets%2Ficon.svg";
</script>
```

JS 문자열 내 `src=`, `href=` 패턴이 HTML 속성과 구분 불가능하여, 리라이팅이 JavaScript 로직을 파괴했습니다.

### 교훈

> 정규식 기반 HTML 리라이팅은 `<script>` 영역을 반드시 보호해야 한다.

---

## 반복 2: `<base>` 태그만 사용

### 접근 방식

URL 재작성을 전부 제거하고, `<base>` 태그 하나로 해결을 시도합니다.

```html
<head>
  <base href="https://example.com/">
  <!-- ... -->
</head>
```

브라우저가 모든 상대 경로를 원본 도메인 기준으로 해석하도록 위임합니다.

### 발생한 문제 1: `history.replaceState` SecurityError

프록시된 Next.js 페이지가 `history.replaceState()`를 호출할 때, 원본 도메인 URL을 인자로 전달합니다.
하지만 문서의 origin은 `http://localhost:3000`이므로 cross-origin 제약에 걸립니다.

```
Uncaught SecurityError: Failed to execute 'replaceState' on 'History':
A history state object with URL 'https://portfolio.k1my3ch4n.xyz/...'
cannot be created in a document with origin 'http://localhost:3000'
```

**해결**: 브릿지 스크립트에서 `history.pushState`/`replaceState`를 패치하여, cross-origin URL이 들어오면 pathname만 추출합니다.

```js
var origPushState = history.pushState;
history.pushState = function(state, title, url) {
  return origPushState.call(this, state, title, patchUrl(url));
};

function patchUrl(url) {
  try {
    var u = new URL(url, location.href);
    if (u.origin !== location.origin) {
      return u.pathname + u.search + u.hash;  // origin 제거
    }
  } catch(e) {}
  return url;
}
```

### 발생한 문제 2: 폰트 CORS 에러

`<base>` 태그로 인해 CSS `@font-face`의 `url()` 참조가 원본 서버를 직접 가리킵니다.
폰트 요청은 CORS 정책이 적용되므로, 원본 서버에 `Access-Control-Allow-Origin` 헤더가 없으면 차단됩니다.

```
Access to font at 'https://example.com/_next/static/media/Font.woff2'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

`<base>` 태그만으로는 리소스가 프록시를 경유하지 않으므로, CORS가 필요한 폰트/이미지 등은 로딩 실패합니다.

### 교훈

> `<base>` 태그는 HTML 속성(src, href 등)에는 동작하지만, CSS `url()`이나 `@font-face`에서 CORS가 필요한 리소스는 해결하지 못한다.
> `history.pushState`/`replaceState`는 same-origin 제약이 있으므로 프록시 환경에서 반드시 패치해야 한다.

---

## 반복 3: 스크립트 보호 방식 (최종)

### 접근 방식

반복 1의 "정규식 리라이팅"과 반복 2의 "안전한 JS 보호"를 결합합니다.

**핵심 아이디어**: `<script>` 블록을 먼저 추출하여 플레이스홀더로 치환한 뒤, 나머지 HTML만 리라이팅하고, 마지막에 스크립트를 복원합니다.

```
원본 HTML
    │
    ▼
① <script>...</script> 블록을 플레이스홀더로 치환
    "<!--__SCRIPT_0__-->"  "<!--__SCRIPT_1__-->"  ...
    │
    ▼
② 안전한 HTML에서 URL 재작성
    - src, href, action, poster 속성
    - srcset 속성
    - inline style url()
    - <style> 태그 내 url()
    │
    ▼
③ 플레이스홀더를 원본 <script> 블록으로 복원
    │
    ▼
④ 브릿지 스크립트 주입
    - history API 패치
    - 스크롤 이벤트 전달
    - ResizeObserver
    │
    ▼
최종 HTML
```

### `<base>` 태그 제거

반복 2에서 사용하던 `<base href="https://original.com/">` 태그를 제거했습니다.

**이유**: 리라이팅된 `/api/proxy?url=...` 경로가 `<base>` 태그에 의해 원본 도메인 기준으로 해석되어,
`https://original.com/api/proxy?url=...`로 요청이 가면서 다시 CORS 에러가 발생했습니다.

```
리라이팅된 CSS url():
  url("/api/proxy?url=https%3A%2F%2Fexample.com%2Ffont.woff2")

<base> 있을 때 (잘못된 해석):
  → https://example.com/api/proxy?url=...  ← CORS 에러!

<base> 없을 때 (올바른 해석):
  → http://localhost:3000/api/proxy?url=...  ← 프록시 경유, 정상
```

스크립트 보호 방식의 정규식 리라이팅이 `src`, `href`, `action`, `poster`, `srcset`, `style url()`, `<style> url()`을 모두 커버하므로 `<base>` 태그 폴백이 불필요합니다.

### CSS 파일 리라이팅 복원

별도 `.css` 파일 요청도 프록시에서 `url()` 참조를 재작성합니다.

```typescript
// proxy.ts — Content-Type별 분기
if (isHtml(contentType)) {
  // HTML: 스크립트 보호 + URL 재작성 + 브릿지 주입
  const rewritten = rewriteHtml(body, finalUrl);
} else if (isCss(contentType)) {
  // CSS: url() 참조만 재작성
  const rewritten = rewriteCss(body, finalUrl);
} else {
  // 기타: 스트리밍 패스스루
  readable.pipe(res);
}
```

### 최종 `rewriteHtml()` 파이프라인

```typescript
export function rewriteHtml(html: string, baseUrl: string): string {
  // 1. <script> 블록 추출 → 플레이스홀더
  // 2. HTML 속성 리라이팅 (src, href, action, poster)
  // 3. srcset 리라이팅
  // 4. inline style url() 리라이팅
  // 5. <style> 태그 내 url() 리라이팅
  // 6. <script> 블록 복원
  // 7. 브릿지 스크립트 주입
  return safe;
}
```

---

## 기타 수정 사항

### `src=""` → `src="about:blank"`

URL이 비어있을 때 `<iframe src="">` 는 일부 브라우저에서 현재 페이지를 재귀적으로 로드하여 무한 루프가 발생합니다.

```tsx
// 수정 전
<iframe src={`/api/proxy?url=${encodeURIComponent(url)}`} />

// 수정 후
<iframe src={url ? `/api/proxy?url=${encodeURIComponent(url)}` : "about:blank"} />
```

### `any` 타입 제거

TypeScript strict 모드 호환을 위해 `any` 타입을 제거했습니다.

```typescript
// ReadableStream 캐스팅
const readable = Readable.fromWeb(
  fetchRes.body as import("stream/web").ReadableStream,  // any 대신 명시적 타입
);

// catch 블록
catch (err: unknown) {  // any 대신 unknown
  if (err instanceof DOMException && err.name === "AbortError") {
    sendError(res, 504, "Request timeout");
  } else if (err instanceof Error) {
    sendError(res, 502, `Failed to fetch: ${err.message}`);
  } else {
    sendError(res, 502, "Failed to fetch");
  }
}
```

### server.ts 에러 핸들링

프록시 핸들러의 예상치 못한 에러가 서버를 크래시하지 않도록 try-catch 래핑을 추가했습니다.

```typescript
if (parsedUrl.pathname?.startsWith(PROXY_PATH)) {
  try {
    await handleProxyRequest(req, res);
  } catch (err) {
    console.error("[proxy] Unhandled error:", err);
    if (!res.headersSent) {
      res.writeHead(502, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Proxy error" }));
    }
  }
  return;
}
```

---

## 문제 해결 요약

| # | 문제 | 원인 | 해결 |
|---|------|------|------|
| 1 | 원본과 다른 화면 렌더링 | 정규식이 `<script>` 내부 JS까지 치환 | 스크립트 보호 방식 도입 |
| 2 | `Application error` (iframe) | `src=""`로 재귀 로딩 | `about:blank` 사용 |
| 3 | `SecurityError: replaceState` | cross-origin URL로 history API 호출 | 브릿지에서 history API 패치 |
| 4 | 폰트 CORS 에러 (1차) | `<base>` 태그가 리소스를 원본 서버로 직접 요청 | URL 재작성 복원 |
| 5 | 폰트 CORS 에러 (2차) | `<base>` 태그가 리라이팅된 프록시 URL도 원본 기준으로 해석 | `<base>` 태그 제거 |
| 6 | 빌드 타입 에러 | `any` 타입 사용 | `unknown` + `instanceof` 가드 |

---

## 최종 아키텍처

```
iframe 요청: /api/proxy?url=https://example.com
                │
                ▼
        ┌─ URL 검증 (SSRF 방지) ─┐
        │                         │
        │  DNS 조회 → IP 검사     │
        │  프로토콜 검사           │
        └────────┬────────────────┘
                 │
                 ▼
          fetch(원본 URL)
                 │
         ┌───────┼───────┐
         │       │       │
        HTML    CSS    기타
         │       │       │
         ▼       ▼       ▼
    스크립트   url()    스트리밍
    보호 후    재작성   패스스루
    URL 재작성    │
    + 브릿지     │
    스크립트     │
    주입         │
         │       │       │
         └───────┼───────┘
                 │
                 ▼
           클라이언트 응답
    (차단 헤더 제거, CORS 허용)
```
