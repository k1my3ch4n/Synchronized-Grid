// 숫자 검증 헬퍼
export const isValidNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

export const isInRange = (v: number, min: number, max: number) =>
  v >= min && v <= max;

// 소켓 이벤트 Rate Limiter
// windowMs 동안 maxEvents 횟수까지 허용, 초과 시 false 반환
export function createRateLimiter(windowMs: number, maxEvents: number) {
  const counters = new Map<string, { count: number; resetAt: number }>();

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
