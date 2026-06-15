import { ENV } from "@/config/env";

type LogLevel = "debug" | "info" | "warn" | "error";
type LogMeta = Record<string, unknown>;

const SENSITIVE_KEY_PATTERN =
  /(address|dob|email|fullName|name|nrc|patient|phone|primaryPhone|token)/i;

function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redact);
  }

  if (value && typeof value === "object") {
    if (
      value instanceof Error ||
      Object.prototype.toString.call(value) === "[object Error]" ||
      ("message" in value && typeof (value as Record<string, unknown>).message === "string" &&
       "stack" in value && typeof (value as Record<string, unknown>).stack === "string")
    ) {
      const err = value as Error;
      return {
        name: err.name || "Error",
        message: err.message,
        stack: err.stack,
      };
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? "[REDACTED]" : redact(entry),
      ]),
    );
  }

  return value;
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  if (!ENV.devLoggingEnabled) return;
  const payload = meta ? redact(meta) : undefined;

  if (level === "debug") {
    console.debug(message, payload);
    return;
  }
  if (level === "info") {
    console.info(message, payload);
    return;
  }
  if (level === "warn") {
    console.warn(message, payload);
    return;
  }
  console.error(message, payload);
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => write("debug", message, meta),
  info: (message: string, meta?: LogMeta) => write("info", message, meta),
  warn: (message: string, meta?: LogMeta) => write("warn", message, meta),
  error: (message: string, meta?: LogMeta) => write("error", message, meta),
};
