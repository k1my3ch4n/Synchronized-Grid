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
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: message }));
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
