/**
 * Retry Utility for Network Requests
 *
 * Provides exponential backoff retry logic for failed network operations.
 */

import { createLogger } from "@/services/logging.service"

const logger = createLogger("RetryUtil")

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number
  /** Initial delay in milliseconds before first retry (default: 1000) */
  initialDelay?: number
  /** Maximum delay in milliseconds (default: 10000) */
  maxDelay?: number
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number
  /** Function to determine if error is retryable (default: true for network errors) */
  shouldRetry?: (error: unknown, attempt: number) => boolean
  /** Called before each retry attempt */
  onRetry?: (error: unknown, attempt: number, delay: number) => void
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  shouldRetry: isRetryableError,
  onRetry: () => {},
}

/**
 * Check if an error is retryable (network errors, timeouts, 5xx errors)
 */
export function isRetryableError(error: unknown): boolean {
  // Network errors (no response)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }

  // Firebase errors that are retryable
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code
    const retryableCodes = [
      'unavailable',
      'resource-exhausted',
      'deadline-exceeded',
      'internal',
      'unknown',
    ]
    return retryableCodes.some(c => code.includes(c))
  }

  // HTTP status-based errors (if available)
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status
    // Retry on 5xx errors, 429 (rate limit), 408 (timeout)
    return status >= 500 || status === 429 || status === 408
  }

  return false
}

/**
 * Calculate delay for the next retry attempt using exponential backoff
 */
export function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 + 0.85 // 0.85 to 1.15
  const delay = Math.min(
    initialDelay * Math.pow(backoffMultiplier, attempt - 1) * jitter,
    maxDelay
  )
  return Math.floor(delay)
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Execute a function with retry logic
 *
 * @example
 * ```ts
 * const result = await withRetry(
 *   () => fetchData(),
 *   { maxRetries: 3, initialDelay: 1000 }
 * )
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: unknown

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry on last attempt or non-retryable errors
      if (attempt > opts.maxRetries || !opts.shouldRetry(error, attempt)) {
        throw error
      }

      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier
      )

      logger.warn(`Retry attempt ${attempt}/${opts.maxRetries}`, {
        delay,
        action: 'retry',
      }, error)

      opts.onRetry(error, attempt, delay)

      await sleep(delay)
    }
  }

  throw lastError
}

/**
 * Create a retryable version of an async function
 *
 * @example
 * ```ts
 * const retryableFetch = createRetryable(fetchData, { maxRetries: 3 })
 * const result = await retryableFetch()
 * ```
 */
export function createRetryable<T extends (...args: Parameters<T>) => Promise<ReturnType<T>>>(
  fn: T,
  options: RetryOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return (...args: Parameters<T>) =>
    withRetry(() => fn(...args), options) as Promise<ReturnType<T>>
}

/**
 * Retry decorator options for class methods
 */
export function retryable(options: RetryOptions = {}) {
  return function <T>(
    _target: object,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<T>>
  ): TypedPropertyDescriptor<(...args: unknown[]) => Promise<T>> {
    const originalMethod = descriptor.value

    if (!originalMethod) {
      return descriptor
    }

    descriptor.value = function (...args: unknown[]): Promise<T> {
      return withRetry(() => originalMethod.apply(this, args), options)
    }

    return descriptor
  }
}
