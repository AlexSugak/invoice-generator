export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

export interface LoggerImplementation {
  log(level: LogLevel, message: string, ...args: unknown[]): void;
}

export class ConsoleLogger implements LoggerImplementation {
  log(level: LogLevel, message: string, ...args: unknown[]): void {
    // Map log level to console method
    switch (level) {
      case LogLevel.TRACE:
        (console.trace || console.debug || console.log).call(
          console,
          message,
          ...args,
        );
        break;
      case LogLevel.DEBUG:
        (console.debug || console.log).call(console, message, ...args);
        break;
      case LogLevel.INFO:
        (console.info || console.log).call(console, message, ...args);
        break;
      case LogLevel.WARN:
        console.warn(message, ...args);
        break;
      case LogLevel.ERROR:
        console.error(message, ...args);
        break;
      default:
        console.log(message, ...args);
    }
  }
}

type LoggerConfig = {
  level: LogLevel;
  implementations: LoggerImplementation[];
};

const defaultLogger = new ConsoleLogger();

const config: LoggerConfig = {
  level: LogLevel.TRACE,
  implementations: [defaultLogger],
};

export function configureLogger(options: {
  level?: LogLevel;
  implementations?: LoggerImplementation[];
}) {
  if (typeof options.level === 'number') {
    config.level = options.level;
  }
  if (
    Array.isArray(options.implementations) &&
    options.implementations.length > 0
  ) {
    config.implementations = options.implementations;
  }
}

function shouldLog(level: LogLevel): boolean {
  return level >= config.level;
}

// Logger factory
export function getLogger(name: string) {
  function log(level: LogLevel, message: string, ...args: unknown[]) {
    if (!shouldLog(level)) {
      return;
    }
    const msg = `[${name}]: ${message}`;
    for (const impl of config.implementations) {
      impl.log(level, msg, ...args);
    }
  }
  return {
    trace: (message: string, ...args: unknown[]) =>
      log(LogLevel.TRACE, message, ...args),
    debug: (message: string, ...args: unknown[]) =>
      log(LogLevel.DEBUG, message, ...args),
    info: (message: string, ...args: unknown[]) =>
      log(LogLevel.INFO, message, ...args),
    warn: (message: string, ...args: unknown[]) =>
      log(LogLevel.WARN, message, ...args),
    error: (message: string, ...args: unknown[]) =>
      log(LogLevel.ERROR, message, ...args),
  };
}
