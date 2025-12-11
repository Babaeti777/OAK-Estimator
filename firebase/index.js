/**
 * Firebase Integration Main Entry Point
 *
 * This module exports all Firebase services in a single interface
 * Import this file to access all Firebase functionality
 */

// Export configuration
export { getFirebaseConfig, COLLECTIONS } from './config.js';

// Export initialization
export {
    initializeFirebase,
    getAuth,
    getFirestore,
    getApp,
    isInitialized,
    getInitializationError,
    resetFirebase,
    getCollection,
    getDocument
} from './firebase-init.js';

// Export authentication
export {
    initAuthListener,
    onAuthStateChange,
    signInWithGoogle,
    signOut,
    getCurrentUser,
    isAuthenticated,
    isAuthLoading,
    getUserId,
    getUserEmail,
    getUserDisplayName,
    getUserPhotoURL,
    waitForAuth,
    refreshToken,
    getIdToken
} from './auth-service.js';

// Export Firestore operations
export {
    fetchDocument,
    saveDocument,
    updateDocument,
    deleteDocument,
    subscribeToDocument,
    batchWrite,
    fetchUserProjects,
    saveUserProjects,
    subscribeToUserProjects,
    getServerTimestamp,
    createQuery
} from './firestore-service.js';

// Export connection monitoring
export {
    initConnectionMonitor,
    setFirestoreConnectionStatus,
    onConnectionChange,
    getConnectionStatus,
    isOnline,
    isFirestoreConnected,
    isFullyConnected,
    pingTest,
    waitForConnection,
    cleanup as cleanupConnectionMonitor,
    monitorFirestoreConnection
} from './connection-monitor.js';

// Export sync manager
export {
    loadLocalProjects,
    saveLocalProjects,
    syncToCloud,
    syncFromCloud,
    startRealtimeSync,
    stopRealtimeSync,
    onSyncStatusChange,
    getSyncStatus,
    setAutoSync,
    clearSyncState,
    setConflictStrategy,
    CONFLICT_STRATEGY
} from './sync-manager.js';

// Export error handling
export {
    ERROR_CATEGORY,
    LOG_LEVEL,
    setLogLevel,
    setLogStorage,
    logger,
    getStoredLogs,
    clearStoredLogs,
    getUserFriendlyError,
    handleError,
    createError,
    withErrorHandling,
    showNotification,
    setNotificationHandler,
    retryOperation,
    exportLogs,
    downloadLogs
} from './error-handler.js';

/**
 * Initialize the complete Firebase system
 *
 * This is a convenience function that initializes all Firebase services
 * in the correct order with proper error handling
 *
 * @param {Object} options - Initialization options
 * @param {Function} options.onAuthChange - Callback for auth state changes
 * @param {Function} options.onConnectionChange - Callback for connection changes
 * @param {Function} options.onSyncUpdate - Callback for realtime sync updates
 * @param {Function} options.onError - Callback for errors
 * @returns {Promise<Object>} Initialization result
 */
export async function initializeApp(options = {}) {
    const {
        onAuthChange = null,
        onConnectionChange = null,
        onSyncUpdate = null,
        onError = null
    } = options;

    try {
        console.log('[Firebase] Initializing OAK Estimator Firebase integration...');

        // Step 1: Initialize Firebase
        const { app, auth, firestore } = await initializeFirebase();
        console.log('[Firebase] ✓ Firebase initialized');

        // Step 2: Initialize connection monitor
        initConnectionMonitor(onConnectionChange);
        console.log('[Firebase] ✓ Connection monitor initialized');

        // Step 3: Initialize auth listener
        const authUnsubscribe = initAuthListener((user, isLoading) => {
            console.log('[Firebase] Auth state:', user ? user.email : 'No user', 'Loading:', isLoading);

            if (onAuthChange) {
                onAuthChange(user, isLoading);
            }

            // Start realtime sync when user signs in
            if (user && !isLoading) {
                console.log('[Firebase] Starting realtime sync for user:', user.email);
                startRealtimeSync(onSyncUpdate);
            } else {
                console.log('[Firebase] Stopping realtime sync');
                stopRealtimeSync();
            }
        });
        console.log('[Firebase] ✓ Auth listener initialized');

        console.log('[Firebase] ✓ OAK Estimator Firebase integration ready');

        return {
            success: true,
            app,
            auth,
            firestore,
            unsubscribe: () => {
                authUnsubscribe();
                stopRealtimeSync();
                cleanupConnectionMonitor();
            }
        };

    } catch (error) {
        console.error('[Firebase] Initialization failed:', error);

        if (onError) {
            onError(error);
        }

        return {
            success: false,
            error: error.message || 'Firebase initialization failed'
        };
    }
}

/**
 * Quick setup function for common use case
 * Handles the entire initialization and returns a simple interface
 *
 * @param {Object} callbacks - Event callbacks
 * @returns {Promise<Object>} App interface
 */
export async function quickSetup(callbacks = {}) {
    const result = await initializeApp(callbacks);

    if (!result.success) {
        throw new Error(result.error);
    }

    // Return simplified interface
    return {
        // Auth methods
        signIn: signInWithGoogle,
        signOut: signOut,
        getUser: getCurrentUser,
        isSignedIn: isAuthenticated,

        // Project methods
        loadProjects: async () => {
            if (isAuthenticated()) {
                const result = await syncFromCloud(true);
                return result.success ? result.projects : loadLocalProjects();
            } else {
                return loadLocalProjects();
            }
        },
        saveProjects: async (projects) => {
            saveLocalProjects(projects);
            if (isAuthenticated()) {
                return await syncToCloud(projects);
            }
            return { success: true, projects };
        },

        // Connection status
        getConnectionStatus: getConnectionStatus,

        // Cleanup
        cleanup: result.unsubscribe
    };
}
