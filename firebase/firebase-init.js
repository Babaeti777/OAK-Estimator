/**
 * Firebase Initialization Service
 *
 * Handles Firebase app initialization with modular SDK (v9+)
 * Provides singleton instances and graceful error handling
 */

import { getFirebaseConfig, COLLECTIONS } from './config.js';

/**
 * Firebase service instances
 * @type {{app: any, auth: any, firestore: any, initialized: boolean}}
 */
const firebaseInstances = {
    app: null,
    auth: null,
    firestore: null,
    initialized: false
};

/**
 * Firebase initialization state
 */
let initializationPromise = null;
let initializationError = null;

/**
 * Initialize Firebase with modular SDK
 *
 * @returns {Promise<{app: any, auth: any, firestore: any}>}
 * @throws {Error} If Firebase SDK is not loaded or initialization fails
 */
export async function initializeFirebase() {
    // Return existing initialization if in progress
    if (initializationPromise) {
        return initializationPromise;
    }

    // Return cached instances if already initialized
    if (firebaseInstances.initialized) {
        return {
            app: firebaseInstances.app,
            auth: firebaseInstances.auth,
            firestore: firebaseInstances.firestore
        };
    }

    // Create new initialization promise
    initializationPromise = (async () => {
        try {
            console.log('[Firebase] Starting initialization...');

            // Check if Firebase SDK is loaded
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded. Please check your internet connection.');
            }

            // Get configuration
            const config = getFirebaseConfig();

            // Initialize Firebase App
            console.log('[Firebase] Initializing app...');
            const app = firebase.initializeApp(config);

            // Get Auth instance
            console.log('[Firebase] Initializing authentication...');
            const auth = firebase.auth();

            // Configure auth settings
            auth.useDeviceLanguage(); // Use device language for auth UI

            // Get Firestore instance
            console.log('[Firebase] Initializing Firestore...');
            const firestore = firebase.firestore();

            // Enable Firestore offline persistence
            try {
                await firestore.enablePersistence({
                    synchronizeTabs: true // Sync across tabs
                });
                console.log('[Firebase] Offline persistence enabled');
            } catch (persistenceError) {
                if (persistenceError.code === 'failed-precondition') {
                    console.warn('[Firebase] Offline persistence failed: Multiple tabs open');
                } else if (persistenceError.code === 'unimplemented') {
                    console.warn('[Firebase] Offline persistence not supported by browser');
                } else {
                    console.warn('[Firebase] Offline persistence error:', persistenceError);
                }
            }

            // Configure Firestore settings for better performance
            firestore.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
            });

            // Store instances
            firebaseInstances.app = app;
            firebaseInstances.auth = auth;
            firebaseInstances.firestore = firestore;
            firebaseInstances.initialized = true;

            console.log('[Firebase] Initialization complete');

            return {
                app,
                auth,
                firestore
            };

        } catch (error) {
            initializationError = error;
            console.error('[Firebase] Initialization failed:', error);
            throw error;
        }
    })();

    return initializationPromise;
}

/**
 * Get Firebase Auth instance
 * @returns {any} Firebase Auth instance
 * @throws {Error} If Firebase is not initialized
 */
export function getAuth() {
    if (!firebaseInstances.initialized) {
        throw new Error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return firebaseInstances.auth;
}

/**
 * Get Firestore instance
 * @returns {any} Firestore instance
 * @throws {Error} If Firebase is not initialized
 */
export function getFirestore() {
    if (!firebaseInstances.initialized) {
        throw new Error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return firebaseInstances.firestore;
}

/**
 * Get Firebase App instance
 * @returns {any} Firebase App instance
 * @throws {Error} If Firebase is not initialized
 */
export function getApp() {
    if (!firebaseInstances.initialized) {
        throw new Error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return firebaseInstances.app;
}

/**
 * Check if Firebase is initialized
 * @returns {boolean}
 */
export function isInitialized() {
    return firebaseInstances.initialized;
}

/**
 * Get initialization error if any
 * @returns {Error|null}
 */
export function getInitializationError() {
    return initializationError;
}

/**
 * Reset Firebase instances (useful for testing)
 */
export function resetFirebase() {
    firebaseInstances.app = null;
    firebaseInstances.auth = null;
    firebaseInstances.firestore = null;
    firebaseInstances.initialized = false;
    initializationPromise = null;
    initializationError = null;
    console.log('[Firebase] Instances reset');
}

/**
 * Get collection reference
 * @param {string} collectionName
 * @returns {any} Firestore collection reference
 */
export function getCollection(collectionName) {
    const firestore = getFirestore();
    return firestore.collection(collectionName);
}

/**
 * Get document reference
 * @param {string} collectionName
 * @param {string} documentId
 * @returns {any} Firestore document reference
 */
export function getDocument(collectionName, documentId) {
    const firestore = getFirestore();
    return firestore.collection(collectionName).doc(documentId);
}

export { COLLECTIONS };
