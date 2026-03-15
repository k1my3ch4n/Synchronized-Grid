type LogLevel = "info" | "warn" | "error";

function formatLog(level: LogLevel, context: string, message: string, meta?: unknown) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    ...(meta !== undefined && { meta }),
  };

  return JSON.stringify(entry);
}

export const logger = {
  info: (context: string, message: string, meta?: unknown) =>
    console.log(formatLog("info", context, message, meta)),

  warn: (context: string, message: string, meta?: unknown) =>
    console.warn(formatLog("warn", context, message, meta)),

  error: (context: string, message: string, meta?: unknown) =>
    console.error(formatLog("error", context, message, meta)),
};
