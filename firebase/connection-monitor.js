/**
 * Connection Monitor Service
 *
 * Monitors network connectivity and Firestore connection state
 * Provides callbacks for connection status changes
 */

/**
 * Connection state
 */
const connectionState = {
    isOnline: navigator.onLine,
    isFirestoreConnected: false,
    listeners: new Set(),
    lastStatusChange: Date.now()
};

/**
 * @typedef {Object} ConnectionStatus
 * @property {boolean} isOnline - Browser online status
 * @property {boolean} isFirestoreConnected - Firestore connection status
 * @property {number} lastStatusChange - Timestamp of last status change
 */

/**
 * Initialize connection monitoring
 * Should be called once during app initialization
 *
 * @param {Function} onConnectionChange - Callback(status)
 */
export function initConnectionMonitor(onConnectionChange) {
    console.log('[ConnectionMonitor] Initializing...');

    // Monitor browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status
    updateConnectionStatus(navigator.onLine, connectionState.isFirestoreConnected);

    // Notify callback
    if (onConnectionChange) {
        onConnectionChange(getConnectionStatus());
    }
}

/**
 * Handle online event
 */
function handleOnline() {
    console.log('[ConnectionMonitor] Browser is online');
    updateConnectionStatus(true, connectionState.isFirestoreConnected);
}

/**
 * Handle offline event
 */
function handleOffline() {
    console.log('[ConnectionMonitor] Browser is offline');
    updateConnectionStatus(false, false); // Offline means Firestore is also disconnected
}

/**
 * Update connection status and notify listeners
 *
 * @param {boolean} isOnline
 * @param {boolean} isFirestoreConnected
 */
function updateConnectionStatus(isOnline, isFirestoreConnected) {
    const statusChanged =
        connectionState.isOnline !== isOnline ||
        connectionState.isFirestoreConnected !== isFirestoreConnected;

    if (statusChanged) {
        connectionState.isOnline = isOnline;
        connectionState.isFirestoreConnected = isFirestoreConnected;
        connectionState.lastStatusChange = Date.now();

        const status = getConnectionStatus();

        console.log('[ConnectionMonitor] Status changed:', status);

        // Notify all listeners
        connectionState.listeners.forEach(listener => {
            try {
                listener(status);
            } catch (error) {
                console.error('[ConnectionMonitor] Listener error:', error);
            }
        });
    }
}

/**
 * Set Firestore connection status
 * Call this when Firestore connection state changes
 *
 * @param {boolean} isConnected
 */
export function setFirestoreConnectionStatus(isConnected) {
    console.log(`[ConnectionMonitor] Firestore ${isConnected ? 'connected' : 'disconnected'}`);
    updateConnectionStatus(connectionState.isOnline, isConnected);
}

/**
 * Register a connection status change listener
 *
 * @param {Function} listener - Callback(status)
 * @returns {Function} Unsubscribe function
 */
export function onConnectionChange(listener) {
    connectionState.listeners.add(listener);

    // Immediately call with current status
    try {
        listener(getConnectionStatus());
    } catch (error) {
        console.error('[ConnectionMonitor] Listener error:', error);
    }

    return () => connectionState.listeners.delete(listener);
}

/**
 * Get current connection status
 *
 * @returns {ConnectionStatus}
 */
export function getConnectionStatus() {
    return {
        isOnline: connectionState.isOnline,
        isFirestoreConnected: connectionState.isFirestoreConnected,
        lastStatusChange: connectionState.lastStatusChange
    };
}

/**
 * Check if browser is online
 *
 * @returns {boolean}
 */
export function isOnline() {
    return connectionState.isOnline;
}

/**
 * Check if Firestore is connected
 *
 * @returns {boolean}
 */
export function isFirestoreConnected() {
    return connectionState.isFirestoreConnected;
}

/**
 * Check if fully connected (both browser and Firestore)
 *
 * @returns {boolean}
 */
export function isFullyConnected() {
    return connectionState.isOnline && connectionState.isFirestoreConnected;
}

/**
 * Ping test to verify actual connectivity
 * Attempts to fetch a small resource to verify internet access
 *
 * @returns {Promise<boolean>}
 */
export async function pingTest() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch('https://www.gstatic.com/generate_204', {
            method: 'HEAD',
            cache: 'no-cache',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const isReachable = response.ok;
        console.log(`[ConnectionMonitor] Ping test: ${isReachable ? 'success' : 'failed'}`);

        return isReachable;

    } catch (error) {
        console.log('[ConnectionMonitor] Ping test failed:', error.message);
        return false;
    }
}

/**
 * Wait for connection to be established
 *
 * @param {number} timeout - Timeout in milliseconds (default: 30000)
 * @returns {Promise<ConnectionStatus>}
 */
export function waitForConnection(timeout = 30000) {
    return new Promise((resolve, reject) => {
        // Already connected
        if (isFullyConnected()) {
            resolve(getConnectionStatus());
            return;
        }

        const timeoutId = setTimeout(() => {
            unsubscribe();
            reject(new Error('Connection timeout'));
        }, timeout);

        const unsubscribe = onConnectionChange((status) => {
            if (status.isOnline && status.isFirestoreConnected) {
                clearTimeout(timeoutId);
                unsubscribe();
                resolve(status);
            }
        });
    });
}

/**
 * Cleanup connection monitor
 * Remove event listeners
 */
export function cleanup() {
    console.log('[ConnectionMonitor] Cleaning up...');
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    connectionState.listeners.clear();
}

/**
 * Monitor Firestore connection using a canary document
 * Periodically checks connection to Firestore
 *
 * @param {any} firestore - Firestore instance
 * @param {number} interval - Check interval in milliseconds (default: 60000)
 * @returns {Function} Stop monitoring function
 */
export function monitorFirestoreConnection(firestore, interval = 60000) {
    console.log('[ConnectionMonitor] Starting Firestore connection monitoring');

    let isMonitoring = true;

    async function checkConnection() {
        if (!isMonitoring) return;

        try {
            // Try to read from a special connection status document
            const statusRef = firestore.collection('.info').doc('connected');
            await statusRef.get({ source: 'server' });

            setFirestoreConnectionStatus(true);

        } catch (error) {
            console.warn('[ConnectionMonitor] Firestore connection check failed:', error.message);
            setFirestoreConnectionStatus(false);
        }

        // Schedule next check
        if (isMonitoring) {
            setTimeout(checkConnection, interval);
        }
    }

    // Start monitoring
    checkConnection();

    // Return stop function
    return () => {
        console.log('[ConnectionMonitor] Stopping Firestore connection monitoring');
        isMonitoring = false;
    };
}
