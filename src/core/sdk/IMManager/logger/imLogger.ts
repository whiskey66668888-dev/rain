type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerState {
  enabled: boolean;
}

const loggerState: LoggerState = {
  enabled: import.meta.env.DEV,
};

const print = (level: LogLevel, scope: string, ...args: unknown[]) => {
  if (!loggerState.enabled) return;
  const prefix = `[IM:${scope}]`;
  switch (level) {
    case 'debug':
      console.debug(prefix, ...args);
      break;
    case 'info':
      console.info(prefix, ...args);
      break;
    case 'warn':
      console.warn(prefix, ...args);
      break;
    case 'error':
      console.error(prefix, ...args);
      break;
    default:
      break;
  }
};

export const setImLogEnabled = (enabled: boolean) => {
  loggerState.enabled = enabled;
};

export const createImLogger = (scope: string) => ({
  debug: (...args: unknown[]) => print('debug', scope, ...args),
  info: (...args: unknown[]) => print('info', scope, ...args),
  warn: (...args: unknown[]) => print('warn', scope, ...args),
  error: (...args: unknown[]) => print('error', scope, ...args),
});
