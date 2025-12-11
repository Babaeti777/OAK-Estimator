/**
 * Firestore Data Service
 *
 * Provides enhanced Firestore operations with:
 * - Retry logic with exponential backoff
 * - Offline detection and fallback
 * - Cache management
 * - Batch operations
 * - Real-time listeners
 */

import { getFirestore, getDocument, COLLECTIONS } from './firebase-init.js';
import { getUserId, isAuthenticated } from './auth-service.js';

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
    maxRetries: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 10000,    // 10 seconds
    backoffMultiplier: 2
};

/**
 * @typedef {Object} FirestoreResult
 * @property {boolean} success - Whether operation succeeded
 * @property {any} data - Data if successful
 * @property {string|null} error - Error message if failed
 * @property {boolean} fromCache - Whether data came from cache
 */

/**
 * Sleep utility for retry delays
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current attempt number (0-indexed)
 * @returns {number} Delay in milliseconds
 */
function getBackoffDelay(attempt) {
    const delay = RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
    return Math.min(delay, RETRY_CONFIG.maxDelay);
}

/**
 * Check if error is a network/offline error
 * @param {Error} error
 * @returns {boolean}
 */
function isOfflineError(error) {
    if (!error) return false;

    const code = error.code || '';
    const message = (error.message || '').toLowerCase();

    return (
        code === 'unavailable' ||
        code === 'offline' ||
        code === 'failed-precondition' ||
        message.includes('offline') ||
        message.includes('network') ||
        message.includes('unavailable')
    );
}

/**
 * Execute Firestore operation with retry logic
 *
 * @param {Function} operation - Async function to execute
 * @param {string} operationName - Name for logging
 * @returns {Promise<any>}
 */
async function executeWithRetry(operation, operationName = 'Firestore operation') {
    let lastError = null;

    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const delay = getBackoffDelay(attempt - 1);
                console.log(`[Firestore] Retry ${attempt}/${RETRY_CONFIG.maxRetries} for ${operationName} after ${delay}ms`);
                await sleep(delay);
            }

            const result = await operation();
            return result;

        } catch (error) {
            lastError = error;

            // Don't retry on certain errors
            if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
                console.error(`[Firestore] ${operationName} failed with non-retryable error:`, error.code);
                throw error;
            }

            // Log retry attempt
            if (attempt < RETRY_CONFIG.maxRetries) {
                console.warn(`[Firestore] ${operationName} attempt ${attempt + 1} failed:`, error.message);
            }
        }
    }

    // All retries exhausted
    console.error(`[Firestore] ${operationName} failed after ${RETRY_CONFIG.maxRetries} retries:`, lastError);
    throw lastError;
}

/**
 * Fetch document with server-first strategy and cache fallback
 *
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @returns {Promise<FirestoreResult>}
 */
export async function fetchDocument(collectionName, documentId) {
    try {
        console.log(`[Firestore] Fetching document: ${collectionName}/${documentId}`);

        const docRef = getDocument(collectionName, documentId);

        // Try server first with retry
        try {
            const snapshot = await executeWithRetry(
                () => docRef.get({ source: 'server' }),
                `fetch ${collectionName}/${documentId} from server`
            );

            if (snapshot.exists) {
                console.log(`[Firestore] Document fetched from server`);
                return {
                    success: true,
                    data: snapshot.data(),
                    error: null,
                    fromCache: false
                };
            } else {
                console.log(`[Firestore] Document does not exist`);
                return {
                    success: true,
                    data: null,
                    error: null,
                    fromCache: false
                };
            }

        } catch (serverError) {
            // If offline, try cache
            if (isOfflineError(serverError)) {
                console.log(`[Firestore] Server unavailable, trying cache...`);

                try {
                    const cachedSnapshot = await docRef.get({ source: 'cache' });

                    if (cachedSnapshot.exists) {
                        console.log(`[Firestore] Document fetched from cache`);
                        return {
                            success: true,
                            data: cachedSnapshot.data(),
                            error: null,
                            fromCache: true
                        };
                    }
                } catch (cacheError) {
                    console.warn(`[Firestore] Cache fetch failed:`, cacheError.message);
                }
            }

            throw serverError;
        }

    } catch (error) {
        console.error(`[Firestore] Fetch document error:`, error);

        return {
            success: false,
            data: null,
            error: error.message || 'Failed to fetch document',
            fromCache: false
        };
    }
}

/**
 * Save document with retry logic
 *
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @param {Object} data - Data to save
 * @param {boolean} merge - Whether to merge with existing data
 * @returns {Promise<FirestoreResult>}
 */
export async function saveDocument(collectionName, documentId, data, merge = false) {
    try {
        console.log(`[Firestore] Saving document: ${collectionName}/${documentId}`);

        const docRef = getDocument(collectionName, documentId);

        await executeWithRetry(
            () => docRef.set(data, merge ? { merge: true } : {}),
            `save ${collectionName}/${documentId}`
        );

        console.log(`[Firestore] Document saved successfully`);

        return {
            success: true,
            data: data,
            error: null,
            fromCache: false
        };

    } catch (error) {
        console.error(`[Firestore] Save document error:`, error);

        return {
            success: false,
            data: null,
            error: error.message || 'Failed to save document',
            fromCache: false
        };
    }
}

/**
 * Update document fields
 *
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<FirestoreResult>}
 */
export async function updateDocument(collectionName, documentId, updates) {
    try {
        console.log(`[Firestore] Updating document: ${collectionName}/${documentId}`);

        const docRef = getDocument(collectionName, documentId);

        await executeWithRetry(
            () => docRef.update(updates),
            `update ${collectionName}/${documentId}`
        );

        console.log(`[Firestore] Document updated successfully`);

        return {
            success: true,
            data: updates,
            error: null,
            fromCache: false
        };

    } catch (error) {
        console.error(`[Firestore] Update document error:`, error);

        return {
            success: false,
            data: null,
            error: error.message || 'Failed to update document',
            fromCache: false
        };
    }
}

/**
 * Delete document
 *
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @returns {Promise<FirestoreResult>}
 */
export async function deleteDocument(collectionName, documentId) {
    try {
        console.log(`[Firestore] Deleting document: ${collectionName}/${documentId}`);

        const docRef = getDocument(collectionName, documentId);

        await executeWithRetry(
            () => docRef.delete(),
            `delete ${collectionName}/${documentId}`
        );

        console.log(`[Firestore] Document deleted successfully`);

        return {
            success: true,
            data: null,
            error: null,
            fromCache: false
        };

    } catch (error) {
        console.error(`[Firestore] Delete document error:`, error);

        return {
            success: false,
            data: null,
            error: error.message || 'Failed to delete document',
            fromCache: false
        };
    }
}

/**
 * Subscribe to real-time document updates
 *
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @param {Function} onUpdate - Callback(data, metadata)
 * @param {Function} onError - Error callback(error)
 * @returns {Function} Unsubscribe function
 */
export function subscribeToDocument(collectionName, documentId, onUpdate, onError) {
    console.log(`[Firestore] Subscribing to: ${collectionName}/${documentId}`);

    const docRef = getDocument(collectionName, documentId);

    const unsubscribe = docRef.onSnapshot(
        {
            includeMetadataChanges: true // Include metadata for offline detection
        },
        (snapshot) => {
            const metadata = snapshot.metadata;

            console.log(`[Firestore] Snapshot received:`, {
                exists: snapshot.exists,
                fromCache: metadata.fromCache,
                hasPendingWrites: metadata.hasPendingWrites
            });

            if (snapshot.exists) {
                onUpdate(snapshot.data(), {
                    fromCache: metadata.fromCache,
                    hasPendingWrites: metadata.hasPendingWrites
                });
            } else {
                onUpdate(null, {
                    fromCache: metadata.fromCache,
                    hasPendingWrites: metadata.hasPendingWrites
                });
            }
        },
        (error) => {
            console.error(`[Firestore] Snapshot error:`, error);
            if (onError) {
                onError(error);
            }
        }
    );

    return unsubscribe;
}

/**
 * Batch write operations
 *
 * @param {Array<{type: string, collection: string, docId: string, data: Object}>} operations
 * @returns {Promise<FirestoreResult>}
 */
export async function batchWrite(operations) {
    try {
        console.log(`[Firestore] Executing batch write with ${operations.length} operations`);

        const firestore = getFirestore();
        const batch = firestore.batch();

        for (const op of operations) {
            const docRef = getDocument(op.collection, op.docId);

            switch (op.type) {
                case 'set':
                    batch.set(docRef, op.data, op.merge ? { merge: true } : {});
                    break;
                case 'update':
                    batch.update(docRef, op.data);
                    break;
                case 'delete':
                    batch.delete(docRef);
                    break;
                default:
                    throw new Error(`Unknown batch operation type: ${op.type}`);
            }
        }

        await executeWithRetry(
            () => batch.commit(),
            'batch write'
        );

        console.log(`[Firestore] Batch write completed successfully`);

        return {
            success: true,
            data: { operationsCount: operations.length },
            error: null,
            fromCache: false
        };

    } catch (error) {
        console.error(`[Firestore] Batch write error:`, error);

        return {
            success: false,
            data: null,
            error: error.message || 'Failed to execute batch write',
            fromCache: false
        };
    }
}

/**
 * User Projects Service
 * Specialized functions for managing user projects
 */

/**
 * Fetch projects for current user
 *
 * @returns {Promise<FirestoreResult>}
 */
export async function fetchUserProjects() {
    if (!isAuthenticated()) {
        return {
            success: false,
            data: null,
            error: 'User not authenticated',
            fromCache: false
        };
    }

    const userId = getUserId();
    return await fetchDocument(COLLECTIONS.USER_PROJECTS, userId);
}

/**
 * Save projects for current user
 *
 * @param {Array} projects - Array of project objects
 * @returns {Promise<FirestoreResult>}
 */
export async function saveUserProjects(projects) {
    if (!isAuthenticated()) {
        return {
            success: false,
            data: null,
            error: 'User not authenticated',
            fromCache: false
        };
    }

    const userId = getUserId();
    const data = {
        projects: projects,
        updatedAt: new Date().toISOString(),
        projectCount: projects.length
    };

    return await saveDocument(COLLECTIONS.USER_PROJECTS, userId, data);
}

/**
 * Subscribe to user projects updates
 *
 * @param {Function} onUpdate - Callback(projects, metadata)
 * @param {Function} onError - Error callback(error)
 * @returns {Function|null} Unsubscribe function or null if not authenticated
 */
export function subscribeToUserProjects(onUpdate, onError) {
    if (!isAuthenticated()) {
        console.warn('[Firestore] Cannot subscribe: User not authenticated');
        return null;
    }

    const userId = getUserId();

    return subscribeToDocument(
        COLLECTIONS.USER_PROJECTS,
        userId,
        (data, metadata) => {
            const projects = data ? data.projects || [] : [];
            onUpdate(projects, metadata);
        },
        onError
    );
}

/**
 * Get Firestore server timestamp
 * Useful for consistent timestamps across devices
 *
 * @returns {any} Firestore FieldValue for server timestamp
 */
export function getServerTimestamp() {
    const firestore = getFirestore();
    return firebase.firestore.FieldValue.serverTimestamp();
}

/**
 * Create a Firestore query
 * Helper for advanced queries
 *
 * @param {string} collectionName
 * @returns {any} Collection reference for chaining queries
 */
export function createQuery(collectionName) {
    const firestore = getFirestore();
    return firestore.collection(collectionName);
}
