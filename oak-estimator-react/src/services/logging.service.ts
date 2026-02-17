/**
 * Structured Logging Service
 *
 * Provides consistent, structured logging across the application
 * with support for different log levels, context, and error tracking.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  component?: string
  action?: string
  userId?: string
  projectId?: string
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

interface LoggerConfig {
  minLevel: LogLevel
  enableConsole: boolean
  enableRemote: boolean
  remoteEndpoint?: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: import.meta.env.MODE === 'production' ? 'info' : 'debug',
  enableConsole: true,
  enableRemote: false,
}

let config: LoggerConfig = { ...DEFAULT_CONFIG }

/**
 * Configure the logger
 */
export function configureLogger(options: Partial<LoggerConfig>): void {
  config = { ...config, ...options }
}

/**
 * Format error for logging
 */
function formatError(error: unknown): { name: string; message: string; stack?: string } | undefined {
  if (!error) return undefined

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  if (typeof error === 'string') {
    return {
      name: 'Error',
      message: error,
    }
  }

  return {
    name: 'UnknownError',
    message: String(error),
  }
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error: formatError(error),
  }
}

/**
 * Check if log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel]
}

/**
 * Output log to console
 */
function logToConsole(entry: LogEntry): void {
  if (!config.enableConsole) return

  const contextStr = entry.context ? ` | ${JSON.stringify(entry.context)}` : ''
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`
  const fullMessage = `${prefix} ${entry.message}${contextStr}`

  switch (entry.level) {
    case 'debug':
      console.debug(fullMessage, entry.error || '')
      break
    case 'info':
      console.info(fullMessage)
      break
    case 'warn':
      console.warn(fullMessage, entry.error || '')
      break
    case 'error':
      console.error(fullMessage, entry.error || '')
      break
  }
}

/**
 * Send log to remote endpoint (for future use)
 */
async function logToRemote(entry: LogEntry): Promise<void> {
  if (!config.enableRemote || !config.remoteEndpoint) return

  try {
    await fetch(config.remoteEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
  } catch (e) {
    // Silently fail - don't log errors about logging
    console.warn('Failed to send log to remote endpoint')
  }
}

/**
 * Main logging function
 */
function log(level: LogLevel, message: string, context?: LogContext, error?: unknown): void {
  if (!shouldLog(level)) return

  const entry = createLogEntry(level, message, context, error)

  logToConsole(entry)
  logToRemote(entry)
}

/**
 * Create a scoped logger for a specific component
 */
export function createLogger(component: string) {
  return {
    debug: (message: string, context?: Omit<LogContext, 'component'>) =>
      log('debug', message, { ...context, component }),

    info: (message: string, context?: Omit<LogContext, 'component'>) =>
      log('info', message, { ...context, component }),

    warn: (message: string, context?: Omit<LogContext, 'component'>, error?: unknown) =>
      log('warn', message, { ...context, component }, error),

    error: (message: string, context?: Omit<LogContext, 'component'>, error?: unknown) =>
      log('error', message, { ...context, component }, error),
  }
}

// Default logger instance
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext, error?: unknown) => log('warn', message, context, error),
  error: (message: string, context?: LogContext, error?: unknown) => log('error', message, context, error),
}

/**
 * Log user action (useful for analytics)
 */
export function logUserAction(action: string, context?: LogContext): void {
  log('info', `User action: ${action}`, { ...context, action })
}

/**
 * Log API request/response
 */
export function logApiCall(
  method: string,
  url: string,
  status?: number,
  duration?: number,
  error?: unknown
): void {
  const level: LogLevel = error ? 'error' : status && status >= 400 ? 'warn' : 'info'
  log(level, `API ${method} ${url}`, { status, duration }, error)
}

/**
 * Log performance metric
 */
export function logPerformance(metric: string, value: number, unit: string = 'ms'): void {
  log('debug', `Performance: ${metric}`, { value, unit })
}
