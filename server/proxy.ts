import { IncomingMessage, ServerResponse } from "http";
import { parse } from "url";
import { Readable } from "stream";
import {
  PROXY_TIMEOUT,
  MAX_RESPONSE_SIZE,
  BLOCKED_RESPONSE_HEADERS,
  PASS_THROUGH_HEADERS,
  BROWSER_USER_AGENT,
} from "./proxy-constants";
import { validateProxyUrl } from "./proxy-security";
import { rewriteHtml, rewriteCss } from "./proxy-url-rewriter";

function sendError(res: ServerResponse, status: number, message: string) {
  res.writeHead(status, {
    "content-type": "text/html; charset=utf-8",
    "x-frame-options": "ALLOWALL",
    "access-control-allow-origin": "*",
  });
  res.end(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:#0a0a12;color:#8b8b9e;font-family:system-ui,sans-serif;padding:32px}
.card{text-align:center;max-width:420px}
.icon{font-size:48px;margin-bottom:16px;opacity:.6}
.status{font-size:14px;font-weight:600;color:#6366f1;letter-spacing:1px;margin-bottom:8px}
.msg{font-size:15px;color:#e8e8ed;line-height:1.5;margin-bottom:12px}
.hint{font-size:12px;color:#6b6b82;line-height:1.6}
</style></head><body>
<div class="card">
<div class="icon">${status === 504 ? "&#9203;" : status === 400 ? "&#128683;" : "&#9888;&#65039;"}</div>
<div class="status">${status}</div>
<div class="msg">${escapeHtml(message)}</div>
<div class="hint">${getErrorHint(status)}</div>
</div>
</body></html>`);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getErrorHint(status: number): string {
  switch (status) {
    case 400:
      return "URL을 확인해 주세요. http:// 또는 https://로 시작하는 완전한 URL이 필요합니다.";
    case 413:
      return "페이지 크기가 제한(50MB)을 초과합니다.";
    case 504:
      return "대상 서버가 응답하지 않습니다. 잘못된 URL이거나 서버가 다운된 상태일 수 있습니다.";
    default:
      return "페이지를 불러올 수 없습니다. URL이 올바른지 확인해 주세요.";
  }
}

function isHtml(contentType: string): boolean {
  return contentType.includes("text/html");
}

function isCss(contentType: string): boolean {
  return contentType.includes("text/css");
}

export async function handleProxyRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const parsedUrl = parse(req.url!, true);
  const targetUrl = parsedUrl.query.url as string;

  if (!targetUrl) {
    sendError(res, 400, "Missing url parameter");
    return;
  }

  const validatedUrl = await validateProxyUrl(targetUrl);

  if (!validatedUrl) {
    sendError(res, 400, "Invalid or blocked URL");
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT);

  try {
    const fetchRes = await fetch(validatedUrl.href, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": BROWSER_USER_AGENT,
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    clearTimeout(timeout);

    // Build response headers — strip blocking headers
    const responseHeaders: Record<string, string> = {};

    for (const name of PASS_THROUGH_HEADERS) {
      const value = fetchRes.headers.get(name);
      if (value && !BLOCKED_RESPONSE_HEADERS.has(name)) {
        responseHeaders[name] = value;
      }
    }

    // Always allow framing
    responseHeaders["x-frame-options"] = "ALLOWALL";
    responseHeaders["access-control-allow-origin"] = "*";

    const contentType = fetchRes.headers.get("content-type") || "";
    // Use the final URL after redirects as the base for rewriting
    const finalUrl = fetchRes.url || validatedUrl.href;

    if (isHtml(contentType)) {
      const body = await fetchRes.text();

      if (body.length > MAX_RESPONSE_SIZE) {
        sendError(res, 413, "Response too large");
        return;
      }

      const rewritten = rewriteHtml(body, finalUrl);

      // Remove content-length since rewriting changes the size
      delete responseHeaders["content-length"];
      responseHeaders["content-type"] =
        contentType || "text/html; charset=utf-8";

      res.writeHead(fetchRes.status, responseHeaders);
      res.end(rewritten);
    } else if (isCss(contentType)) {
      const body = await fetchRes.text();

      if (body.length > MAX_RESPONSE_SIZE) {
        sendError(res, 413, "Response too large");
        return;
      }

      const rewritten = rewriteCss(body, finalUrl);

      delete responseHeaders["content-length"];
      responseHeaders["content-type"] =
        contentType || "text/css; charset=utf-8";

      res.writeHead(fetchRes.status, responseHeaders);
      res.end(rewritten);
    } else {
      // Stream other content types (JS, images, fonts, etc.)
      res.writeHead(fetchRes.status, responseHeaders);

      if (fetchRes.body) {
        const readable = Readable.fromWeb(
          fetchRes.body as import("stream/web").ReadableStream,
        );
        readable.pipe(res);
      } else {
        res.end();
      }
    }
  } catch (err: unknown) {
    clearTimeout(timeout);

    if (err instanceof DOMException && err.name === "AbortError") {
      sendError(res, 504, "Request timeout");
    } else if (err instanceof Error) {
      sendError(res, 502, `Failed to fetch: ${err.message}`);
    } else {
      sendError(res, 502, "Failed to fetch");
    }
  }
}
