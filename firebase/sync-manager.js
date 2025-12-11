/**
 * Sync Manager
 *
 * Manages synchronization between local storage and Firestore
 * Handles conflict resolution and maintains data consistency
 */

import {
    fetchUserProjects,
    saveUserProjects,
    subscribeToUserProjects
} from './firestore-service.js';
import { isAuthenticated, getUserId } from './auth-service.js';
import { isFullyConnected } from './connection-monitor.js';

/**
 * Sync state
 */
const syncState = {
    isSyncing: false,
    lastSyncTime: null,
    lastSyncedHash: null,
    syncInProgress: false,
    syncListeners: new Set(),
    realtimeUnsubscribe: null,
    autoSyncEnabled: true,
    syncQueue: []
};

/**
 * @typedef {Object} SyncResult
 * @property {boolean} success - Whether sync succeeded
 * @property {Array} projects - Synced projects
 * @property {string|null} error - Error message if failed
 * @property {boolean} fromCache - Whether data came from cache
 * @property {string} direction - 'upload' | 'download' | 'merge'
 */

/**
 * Conflict resolution strategies
 */
export const CONFLICT_STRATEGY = {
    SERVER_WINS: 'server_wins',           // Always use server data
    LOCAL_WINS: 'local_wins',             // Always use local data
    LATEST_WINS: 'latest_wins',           // Use newest by timestamp
    MERGE: 'merge',                        // Intelligent merge
    MANUAL: 'manual'                       // Require manual resolution
};

/**
 * Default conflict resolution strategy
 */
let currentConflictStrategy = CONFLICT_STRATEGY.LATEST_WINS;

/**
 * Set conflict resolution strategy
 *
 * @param {string} strategy - One of CONFLICT_STRATEGY values
 */
export function setConflictStrategy(strategy) {
    if (!Object.values(CONFLICT_STRATEGY).includes(strategy)) {
        throw new Error(`Invalid conflict strategy: ${strategy}`);
    }
    currentConflictStrategy = strategy;
    console.log(`[SyncManager] Conflict strategy set to: ${strategy}`);
}

/**
 * Calculate hash of projects array for change detection
 *
 * @param {Array} projects
 * @returns {string}
 */
function calculateHash(projects) {
    if (!projects || projects.length === 0) {
        return 'empty';
    }

    // Simple hash based on JSON string
    const str = JSON.stringify(projects);
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return hash.toString(36);
}

/**
 * Get local storage key for current user
 *
 * @returns {string}
 */
function getStorageKey() {
    const userId = getUserId();
    return userId
        ? `constructionEstimatorProjects:${userId}`
        : 'constructionEstimatorProjects';
}

/**
 * Load projects from local storage
 *
 * @returns {Array}
 */
export function loadLocalProjects() {
    try {
        const key = getStorageKey();
        const stored = localStorage.getItem(key);

        if (!stored) {
            console.log('[SyncManager] No local projects found');
            return [];
        }

        const projects = JSON.parse(stored);
        console.log(`[SyncManager] Loaded ${projects.length} projects from local storage`);

        return Array.isArray(projects) ? projects : [];

    } catch (error) {
        console.error('[SyncManager] Error loading local projects:', error);
        return [];
    }
}

/**
 * Save projects to local storage
 *
 * @param {Array} projects
 * @returns {boolean} Success status
 */
export function saveLocalProjects(projects) {
    try {
        const key = getStorageKey();
        localStorage.setItem(key, JSON.stringify(projects));

        console.log(`[SyncManager] Saved ${projects.length} projects to local storage`);
        return true;

    } catch (error) {
        console.error('[SyncManager] Error saving local projects:', error);
        return false;
    }
}

/**
 * Merge local and remote projects intelligently
 *
 * @param {Array} localProjects
 * @param {Array} remoteProjects
 * @param {string} strategy - Conflict resolution strategy
 * @returns {Array} Merged projects
 */
function mergeProjects(localProjects, remoteProjects, strategy = currentConflictStrategy) {
    console.log(`[SyncManager] Merging projects with strategy: ${strategy}`);

    // Simple strategies
    if (strategy === CONFLICT_STRATEGY.SERVER_WINS) {
        return remoteProjects;
    }

    if (strategy === CONFLICT_STRATEGY.LOCAL_WINS) {
        return localProjects;
    }

    // Intelligent merge strategies
    const projectMap = new Map();

    // Add remote projects first
    remoteProjects.forEach(project => {
        projectMap.set(project.id, {
            ...project,
            source: 'remote'
        });
    });

    // Merge local projects
    localProjects.forEach(localProject => {
        const remoteProject = projectMap.get(localProject.id);

        if (!remoteProject) {
            // Local-only project
            projectMap.set(localProject.id, {
                ...localProject,
                source: 'local'
            });
        } else {
            // Conflict: project exists in both
            let resolvedProject;

            if (strategy === CONFLICT_STRATEGY.LATEST_WINS) {
                // Compare timestamps
                const localTime = new Date(localProject.updatedAt || 0).getTime();
                const remoteTime = new Date(remoteProject.updatedAt || 0).getTime();

                resolvedProject = localTime > remoteTime ? localProject : remoteProject;

                console.log(`[SyncManager] Conflict for project ${localProject.id}: ${
                    localTime > remoteTime ? 'local' : 'remote'
                } wins (local: ${localTime}, remote: ${remoteTime})`);

            } else if (strategy === CONFLICT_STRATEGY.MERGE) {
                // Intelligent field-level merge
                resolvedProject = { ...remoteProject };

                // Merge fields based on timestamps or logic
                Object.keys(localProject).forEach(key => {
                    if (key === 'updatedAt') {
                        // Use latest timestamp
                        const localTime = new Date(localProject.updatedAt || 0).getTime();
                        const remoteTime = new Date(remoteProject.updatedAt || 0).getTime();
                        resolvedProject.updatedAt = localTime > remoteTime
                            ? localProject.updatedAt
                            : remoteProject.updatedAt;
                    } else if (key === 'lineItems') {
                        // For arrays, use the version with more items (or latest timestamp)
                        if (localProject.lineItems.length > remoteProject.lineItems.length) {
                            resolvedProject.lineItems = localProject.lineItems;
                        }
                    } else {
                        // For other fields, prefer non-empty values
                        if (localProject[key] && !remoteProject[key]) {
                            resolvedProject[key] = localProject[key];
                        }
                    }
                });
            }

            projectMap.set(localProject.id, {
                ...resolvedProject,
                source: 'merged'
            });
        }
    });

    // Convert map to array and remove source metadata
    const merged = Array.from(projectMap.values()).map(({ source, ...project }) => project);

    console.log(`[SyncManager] Merge complete: ${merged.length} projects`);

    return merged;
}

/**
 * Sync projects to cloud
 *
 * @param {Array} projects - Projects to sync
 * @returns {Promise<SyncResult>}
 */
export async function syncToCloud(projects) {
    if (!isAuthenticated()) {
        return {
            success: false,
            projects: [],
            error: 'Not authenticated',
            fromCache: false,
            direction: 'upload'
        };
    }

    if (syncState.syncInProgress) {
        console.log('[SyncManager] Sync already in progress, queuing...');
        return new Promise((resolve) => {
            syncState.syncQueue.push(() => syncToCloud(projects).then(resolve));
        });
    }

    try {
        syncState.syncInProgress = true;
        notifySyncListeners('syncing', true);

        console.log(`[SyncManager] Syncing ${projects.length} projects to cloud...`);

        // Calculate hash before sync
        const hash = calculateHash(projects);

        // Save to Firestore
        const result = await saveUserProjects(projects);

        if (result.success) {
            syncState.lastSyncTime = Date.now();
            syncState.lastSyncedHash = hash;

            // Save to local storage as backup
            saveLocalProjects(projects);

            console.log('[SyncManager] Sync to cloud successful');

            notifySyncListeners('success', false);

            return {
                success: true,
                projects: projects,
                error: null,
                fromCache: false,
                direction: 'upload'
            };
        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error('[SyncManager] Sync to cloud failed:', error);

        notifySyncListeners('error', false);

        return {
            success: false,
            projects: [],
            error: error.message || 'Sync failed',
            fromCache: false,
            direction: 'upload'
        };

    } finally {
        syncState.syncInProgress = false;

        // Process queued syncs
        if (syncState.syncQueue.length > 0) {
            const nextSync = syncState.syncQueue.shift();
            setTimeout(nextSync, 100);
        }
    }
}

/**
 * Sync projects from cloud
 *
 * @param {boolean} mergeWithLocal - Whether to merge with local projects
 * @returns {Promise<SyncResult>}
 */
export async function syncFromCloud(mergeWithLocal = true) {
    if (!isAuthenticated()) {
        return {
            success: false,
            projects: [],
            error: 'Not authenticated',
            fromCache: false,
            direction: 'download'
        };
    }

    try {
        console.log('[SyncManager] Syncing from cloud...');

        const result = await fetchUserProjects();

        if (result.success) {
            let remoteProjects = result.data ? result.data.projects || [] : [];

            let finalProjects = remoteProjects;

            // Merge with local if requested
            if (mergeWithLocal) {
                const localProjects = loadLocalProjects();

                if (localProjects.length > 0) {
                    finalProjects = mergeProjects(localProjects, remoteProjects);
                }
            }

            // Save to local storage
            saveLocalProjects(finalProjects);

            // Update sync state
            syncState.lastSyncTime = Date.now();
            syncState.lastSyncedHash = calculateHash(finalProjects);

            console.log(`[SyncManager] Sync from cloud successful: ${finalProjects.length} projects`);

            return {
                success: true,
                projects: finalProjects,
                error: null,
                fromCache: result.fromCache,
                direction: mergeWithLocal ? 'merge' : 'download'
            };

        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error('[SyncManager] Sync from cloud failed:', error);

        return {
            success: false,
            projects: [],
            error: error.message || 'Sync failed',
            fromCache: false,
            direction: 'download'
        };
    }
}

/**
 * Start real-time sync listener
 *
 * @param {Function} onUpdate - Callback(projects, metadata)
 * @returns {Function|null} Unsubscribe function
 */
export function startRealtimeSync(onUpdate) {
    if (!isAuthenticated()) {
        console.warn('[SyncManager] Cannot start realtime sync: Not authenticated');
        return null;
    }

    if (syncState.realtimeUnsubscribe) {
        console.log('[SyncManager] Realtime sync already active');
        return syncState.realtimeUnsubscribe;
    }

    console.log('[SyncManager] Starting realtime sync...');

    syncState.realtimeUnsubscribe = subscribeToUserProjects(
        (projects, metadata) => {
            // Skip if sync is in progress (prevents loops)
            if (syncState.syncInProgress) {
                console.log('[SyncManager] Skipping snapshot: sync in progress');
                return;
            }

            // Calculate hash to detect real changes
            const newHash = calculateHash(projects);

            if (newHash === syncState.lastSyncedHash) {
                console.log('[SyncManager] Skipping snapshot: no changes');
                return;
            }

            console.log('[SyncManager] Realtime update received:', {
                projectCount: projects.length,
                fromCache: metadata.fromCache,
                hasPendingWrites: metadata.hasPendingWrites
            });

            // Update local storage
            saveLocalProjects(projects);

            // Update sync state
            syncState.lastSyncedHash = newHash;
            syncState.lastSyncTime = Date.now();

            // Notify callback
            if (onUpdate) {
                onUpdate(projects, metadata);
            }
        },
        (error) => {
            console.error('[SyncManager] Realtime sync error:', error);
            notifySyncListeners('error', false);
        }
    );

    return syncState.realtimeUnsubscribe;
}

/**
 * Stop real-time sync listener
 */
export function stopRealtimeSync() {
    if (syncState.realtimeUnsubscribe) {
        console.log('[SyncManager] Stopping realtime sync...');
        syncState.realtimeUnsubscribe();
        syncState.realtimeUnsubscribe = null;
    }
}

/**
 * Register sync status listener
 *
 * @param {Function} listener - Callback(status, isSyncing)
 * @returns {Function} Unsubscribe function
 */
export function onSyncStatusChange(listener) {
    syncState.syncListeners.add(listener);
    return () => syncState.syncListeners.delete(listener);
}

/**
 * Notify sync listeners
 *
 * @param {string} status - 'syncing' | 'success' | 'error'
 * @param {boolean} isSyncing
 */
function notifySyncListeners(status, isSyncing) {
    syncState.syncListeners.forEach(listener => {
        try {
            listener(status, isSyncing);
        } catch (error) {
            console.error('[SyncManager] Listener error:', error);
        }
    });
}

/**
 * Get sync status
 *
 * @returns {{isSyncing: boolean, lastSyncTime: number|null, autoSyncEnabled: boolean}}
 */
export function getSyncStatus() {
    return {
        isSyncing: syncState.syncInProgress,
        lastSyncTime: syncState.lastSyncTime,
        autoSyncEnabled: syncState.autoSyncEnabled
    };
}

/**
 * Enable/disable auto sync
 *
 * @param {boolean} enabled
 */
export function setAutoSync(enabled) {
    syncState.autoSyncEnabled = enabled;
    console.log(`[SyncManager] Auto-sync ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Clear sync state (useful for sign-out)
 */
export function clearSyncState() {
    console.log('[SyncManager] Clearing sync state...');

    stopRealtimeSync();

    syncState.isSyncing = false;
    syncState.lastSyncTime = null;
    syncState.lastSyncedHash = null;
    syncState.syncInProgress = false;
    syncState.syncQueue = [];
}
