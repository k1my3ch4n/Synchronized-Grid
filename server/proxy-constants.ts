export const PROXY_PATH = "/api/proxy";
export const PROXY_TIMEOUT = 10_000;
export const MAX_RESPONSE_SIZE = 50 * 1024 * 1024; // 50MB

export const BLOCKED_RESPONSE_HEADERS = new Set([
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
]);

export const PASS_THROUGH_HEADERS = [
  "content-type",
  "cache-control",
  "etag",
  "last-modified",
  "content-length",
];

export const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
