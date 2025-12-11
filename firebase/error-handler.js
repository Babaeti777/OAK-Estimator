/**
 * Error Handler and Logger
 *
 * Centralized error handling and logging utilities
 * Provides user-friendly error messages and detailed logging
 */

/**
 * Error categories
 */
export const ERROR_CATEGORY = {
    AUTH: 'authentication',
    NETWORK: 'network',
    PERMISSION: 'permission',
    DATA: 'data',
    UNKNOWN: 'unknown'
};

/**
 * Log levels
 */
export const LOG_LEVEL = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

/**
 * Logger configuration
 */
const loggerConfig = {
    minLevel: LOG_LEVEL.INFO,
    enableConsole: true,
    enableStorage: false,
    maxStoredLogs: 100,
    logPrefix: '[OAK-Estimator]'
};

/**
 * Stored logs (in memory)
 */
const storedLogs = [];

/**
 * Set minimum log level
 *
 * @param {number} level - One of LOG_LEVEL values
 */
export function setLogLevel(level) {
    loggerConfig.minLevel = level;
}

/**
 * Enable/disable log storage
 *
 * @param {boolean} enabled
 */
export function setLogStorage(enabled) {
    loggerConfig.enableStorage = enabled;
}

/**
 * Log message with level
 *
 * @param {number} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Optional data
 */
function log(level, message, data = null) {
    if (level < loggerConfig.minLevel) {
        return;
    }

    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVEL).find(key => LOG_LEVEL[key] === level);

    const logEntry = {
        timestamp,
        level: levelName,
        message,
        data
    };

    // Store in memory if enabled
    if (loggerConfig.enableStorage) {
        storedLogs.push(logEntry);

        // Limit stored logs
        if (storedLogs.length > loggerConfig.maxStoredLogs) {
            storedLogs.shift();
        }
    }

    // Console output if enabled
    if (loggerConfig.enableConsole) {
        const prefix = `${loggerConfig.logPrefix} [${levelName}]`;

        switch (level) {
            case LOG_LEVEL.DEBUG:
                console.debug(prefix, message, data || '');
                break;
            case LOG_LEVEL.INFO:
                console.info(prefix, message, data || '');
                break;
            case LOG_LEVEL.WARN:
                console.warn(prefix, message, data || '');
                break;
            case LOG_LEVEL.ERROR:
                console.error(prefix, message, data || '');
                break;
        }
    }
}

/**
 * Logger functions
 */
export const logger = {
    debug: (message, data) => log(LOG_LEVEL.DEBUG, message, data),
    info: (message, data) => log(LOG_LEVEL.INFO, message, data),
    warn: (message, data) => log(LOG_LEVEL.WARN, message, data),
    error: (message, data) => log(LOG_LEVEL.ERROR, message, data)
};

/**
 * Get stored logs
 *
 * @returns {Array}
 */
export function getStoredLogs() {
    return [...storedLogs];
}

/**
 * Clear stored logs
 */
export function clearStoredLogs() {
    storedLogs.length = 0;
}

/**
 * Categorize Firebase error
 *
 * @param {Error} error
 * @returns {string} Error category
 */
function categorizeError(error) {
    if (!error || !error.code) {
        return ERROR_CATEGORY.UNKNOWN;
    }

    const code = error.code;

    // Authentication errors
    if (code.startsWith('auth/')) {
        return ERROR_CATEGORY.AUTH;
    }

    // Network errors
    if (
        code === 'unavailable' ||
        code === 'deadline-exceeded' ||
        code === 'cancelled' ||
        code.includes('network')
    ) {
        return ERROR_CATEGORY.NETWORK;
    }

    // Permission errors
    if (
        code === 'permission-denied' ||
        code === 'unauthenticated'
    ) {
        return ERROR_CATEGORY.PERMISSION;
    }

    // Data errors
    if (
        code === 'invalid-argument' ||
        code === 'not-found' ||
        code === 'already-exists'
    ) {
        return ERROR_CATEGORY.DATA;
    }

    return ERROR_CATEGORY.UNKNOWN;
}

/**
 * Get user-friendly error message
 *
 * @param {Error} error
 * @returns {string}
 */
export function getUserFriendlyError(error) {
    if (!error) {
        return 'An unknown error occurred.';
    }

    const code = error.code || '';
    const category = categorizeError(error);

    // Authentication errors
    if (category === ERROR_CATEGORY.AUTH) {
        switch (code) {
            case 'auth/popup-closed-by-user':
                return 'Sign-in was cancelled.';
            case 'auth/popup-blocked':
                return 'Sign-in popup was blocked. Please allow popups for this site.';
            case 'auth/network-request-failed':
                return 'Network error during sign-in. Please check your connection.';
            case 'auth/too-many-requests':
                return 'Too many sign-in attempts. Please try again later.';
            case 'auth/user-disabled':
                return 'This account has been disabled.';
            case 'auth/invalid-credential':
                return 'Invalid credentials. Please try again.';
            default:
                return 'Authentication failed. Please try again.';
        }
    }

    // Network errors
    if (category === ERROR_CATEGORY.NETWORK) {
        return 'Network connection issue. Please check your internet and try again.';
    }

    // Permission errors
    if (category === ERROR_CATEGORY.PERMISSION) {
        return 'You don\'t have permission to perform this action. Please sign in.';
    }

    // Data errors
    if (category === ERROR_CATEGORY.DATA) {
        switch (code) {
            case 'not-found':
                return 'The requested data was not found.';
            case 'already-exists':
                return 'This data already exists.';
            case 'invalid-argument':
                return 'Invalid data provided.';
            default:
                return 'Data operation failed. Please try again.';
        }
    }

    // Fallback
    return error.message || 'An error occurred. Please try again.';
}

/**
 * Handle error with logging and user notification
 *
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @param {Function} onError - Optional callback for custom error handling
 * @returns {string} User-friendly error message
 */
export function handleError(error, context = 'Operation', onError = null) {
    const category = categorizeError(error);
    const userMessage = getUserFriendlyError(error);

    // Log error
    logger.error(`${context} failed`, {
        category,
        code: error.code,
        message: error.message,
        userMessage
    });

    // Custom error handler
    if (onError) {
        try {
            onError(error, category, userMessage);
        } catch (handlerError) {
            logger.error('Error handler failed', handlerError);
        }
    }

    return userMessage;
}

/**
 * Create error object with additional context
 *
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} context - Additional context
 * @returns {Error}
 */
export function createError(message, code = 'unknown', context = {}) {
    const error = new Error(message);
    error.code = code;
    error.context = context;
    error.timestamp = new Date().toISOString();

    return error;
}

/**
 * Wrap async function with error handling
 *
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context for error logging
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, context = 'Operation') {
    return async function (...args) {
        try {
            return await fn(...args);
        } catch (error) {
            handleError(error, context);
            throw error;
        }
    };
}

/**
 * Show user notification (can be customized to use UI toast/modal)
 *
 * @param {string} message - Message to show
 * @param {string} type - 'info' | 'success' | 'warning' | 'error'
 */
export function showNotification(message, type = 'info') {
    // Default implementation using alert (can be replaced with custom UI)
    console.log(`[Notification] ${type.toUpperCase()}: ${message}`);

    // Store notification callbacks
    if (notificationCallback) {
        notificationCallback(message, type);
    } else {
        // Fallback to browser notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('OAK Estimator', {
                body: message,
                icon: '/favicon.ico'
            });
        }
    }
}

/**
 * Notification callback
 */
let notificationCallback = null;

/**
 * Set custom notification handler
 *
 * @param {Function} callback - Function(message, type)
 */
export function setNotificationHandler(callback) {
    notificationCallback = callback;
}

/**
 * Retry operation with exponential backoff
 *
 * @param {Function} operation - Async operation to retry
 * @param {Object} options - Retry options
 * @returns {Promise<any>}
 */
export async function retryOperation(
    operation,
    options = {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        onRetry: null
    }
) {
    let lastError = null;

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const delay = Math.min(
                    options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1),
                    options.maxDelay
                );

                logger.debug(`Retry attempt ${attempt}/${options.maxRetries} after ${delay}ms`);

                await new Promise(resolve => setTimeout(resolve, delay));

                if (options.onRetry) {
                    options.onRetry(attempt, lastError);
                }
            }

            return await operation();

        } catch (error) {
            lastError = error;

            // Don't retry on certain errors
            const category = categorizeError(error);
            if (category === ERROR_CATEGORY.PERMISSION) {
                throw error;
            }

            if (attempt === options.maxRetries) {
                throw error;
            }
        }
    }

    throw lastError;
}

/**
 * Export logs for debugging
 *
 * @returns {string} JSON string of logs
 */
export function exportLogs() {
    return JSON.stringify(storedLogs, null, 2);
}

/**
 * Download logs as file
 */
export function downloadLogs() {
    const logsJson = exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `oak-estimator-logs-${new Date().toISOString()}.json`;
    a.click();

    URL.revokeObjectURL(url);

    logger.info('Logs downloaded');
}
