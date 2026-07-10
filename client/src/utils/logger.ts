type LogLevel = "info" | "warn" | "error" | "debug";

type LogContext = Record<string, unknown>;

const isDevelopment = process.env.NODE_ENV !== "production";

const formatMessage = (level: LogLevel, message: string) =>
  `[Finia:${level.toUpperCase()}] ${message}`;

const write = (
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown,
) => {
  if (level === "debug" && !isDevelopment) return;
  if (!isDevelopment && level !== "error") return;

  const payload = context ? [formatMessage(level, message), context] : [formatMessage(level, message)];

  switch (level) {
    case "info":
      console.info(...payload);
      break;
    case "warn":
      console.warn(...payload);
      break;
    case "error":
      console.error(...payload, error ?? "");
      break;
    case "debug":
      console.debug(...payload);
      break;
  }
};

export const Logger = {
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, error?: unknown, context?: LogContext) =>
    write("error", message, context, error),
  debug: (message: string, context?: LogContext) => write("debug", message, context),
};
