interface LogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  component: string;
  message: string;
  details?: Record<string, unknown>;
  error?: string;
}

class StructuredLogger {
  private component: string;

  constructor(component: string) {
    this.component = component;
  }

  private formatLog(entry: LogEntry): void {
    // Output JSON-formatted logs for structured analysis
    console.log(JSON.stringify(entry));
  }

  debug(message: string, details?: Record<string, unknown>): void {
    this.formatLog({
      timestamp: new Date().toISOString(),
      level: "debug",
      component: this.component,
      message,
      details
    });
  }

  info(message: string, details?: Record<string, unknown>): void {
    this.formatLog({
      timestamp: new Date().toISOString(),
      level: "info",
      component: this.component,
      message,
      details
    });
  }

  warn(message: string, details?: Record<string, unknown>): void {
    this.formatLog({
      timestamp: new Date().toISOString(),
      level: "warn",
      component: this.component,
      message,
      details
    });
  }

  error(message: string, error?: unknown, details?: Record<string, unknown>): void {
    const errorMsg = error instanceof Error ? error.message : String(error);
    this.formatLog({
      timestamp: new Date().toISOString(),
      level: "error",
      component: this.component,
      message,
      error: errorMsg,
      details
    });
  }
}

export function createLogger(component: string): StructuredLogger {
  return new StructuredLogger(component);
}
