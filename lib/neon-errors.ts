export function isNeonQuotaError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("project has been suspended") ||
    msg.includes("exceeded the free tier") ||
    msg.includes("compute is disabled") ||
    msg.includes("project is disabled") ||
    msg.includes("free tier limit")
  );
}
