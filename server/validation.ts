// 문자열 검증 헬퍼 (non-empty string)
export const isValidString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

// 숫자 검증 헬퍼
export const isValidNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

export const isInRange = (v: number, min: number, max: number) =>
  v >= min && v <= max;

// 소켓 이벤트 Rate Limiter
// windowMs 동안 maxEvents 횟수까지 허용, 초과 시 false 반환
export function createRateLimiter(windowMs: number, maxEvents: number) {
  const counters = new Map<string, { count: number; resetAt: number }>();

  // 만료된 엔트리 주기적 정리 (60초마다)
  const GC_INTERVAL = 60_000;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of counters) {
      if (now >= entry.resetAt) {
        counters.delete(key);
      }
    }
  }, GC_INTERVAL).unref();

  return (socketId: string): boolean => {
    const now = Date.now();
    const entry = counters.get(socketId);

    if (!entry || now >= entry.resetAt) {
      counters.set(socketId, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (entry.count >= maxEvents) {
      return false;
    }

    entry.count++;
    return true;
  };
}
