import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format number with commas
 */
export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Type guard to check if a value is an Error object
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error
}

/**
 * Type guard to check if a value has a message property
 */
export function hasMessage(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  )
}

/**
 * Type guard to check if a value has a code property (Firebase errors)
 */
export function hasErrorCode(value: unknown): value is { code: string; message?: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof (value as { code: unknown }).code === 'string'
  )
}

/**
 * Extract error message from unknown error type
 * Safely handles Error objects, objects with message property, and strings
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message
  }
  if (hasMessage(error)) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}
