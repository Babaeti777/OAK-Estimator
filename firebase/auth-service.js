/**
 * Firebase Authentication Service
 *
 * Provides authentication functionality with improved error handling,
 * state management, and user session tracking
 */

import { getAuth } from './firebase-init.js';

/**
 * Authentication state
 */
const authState = {
    currentUser: null,
    isAuthenticated: false,
    isLoading: false,
    listeners: new Set()
};

/**
 * @typedef {Object} User
 * @property {string} uid - User ID
 * @property {string} email - User email
 * @property {string} displayName - User display name
 * @property {string} photoURL - User photo URL
 */

/**
 * @typedef {Object} AuthResult
 * @property {boolean} success - Whether operation succeeded
 * @property {User|null} user - User object if successful
 * @property {string|null} error - Error message if failed
 */

/**
 * Initialize authentication state listener
 * This should be called once during app initialization
 *
 * @param {Function} onAuthStateChange - Callback function(user, isLoading)
 * @returns {Function} Unsubscribe function
 */
export function initAuthListener(onAuthStateChange) {
    const auth = getAuth();

    authState.isLoading = true;

    const unsubscribe = auth.onAuthStateChanged(
        (user) => {
            authState.currentUser = user;
            authState.isAuthenticated = !!user;
            authState.isLoading = false;

            console.log('[Auth] State changed:', user ? `User: ${user.email}` : 'No user');

            // Notify callback
            if (onAuthStateChange) {
                onAuthStateChange(user, false);
            }

            // Notify all registered listeners
            authState.listeners.forEach(listener => {
                try {
                    listener(user, false);
                } catch (error) {
                    console.error('[Auth] Listener error:', error);
                }
            });
        },
        (error) => {
            console.error('[Auth] Auth state listener error:', error);
            authState.isLoading = false;

            // Notify callback of error
            if (onAuthStateChange) {
                onAuthStateChange(null, false);
            }

            // Notify all registered listeners
            authState.listeners.forEach(listener => {
                try {
                    listener(null, false);
                } catch (error) {
                    console.error('[Auth] Listener error:', error);
                }
            });
        }
    );

    return unsubscribe;
}

/**
 * Register an auth state change listener
 * @param {Function} listener - Callback function(user, isLoading)
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(listener) {
    authState.listeners.add(listener);
    return () => authState.listeners.delete(listener);
}

/**
 * Sign in with Google popup
 *
 * @returns {Promise<AuthResult>}
 */
export async function signInWithGoogle() {
    try {
        console.log('[Auth] Starting Google sign-in...');
        authState.isLoading = true;

        const auth = getAuth();
        const provider = new firebase.auth.GoogleAuthProvider();

        // Configure provider
        provider.setCustomParameters({
            prompt: 'select_account' // Always show account selection
        });

        // Set persistence to LOCAL (survives browser restart)
        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

        // Sign in with popup
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        console.log('[Auth] Sign-in successful:', user.email);

        authState.isLoading = false;

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            },
            error: null
        };

    } catch (error) {
        authState.isLoading = false;

        console.error('[Auth] Sign-in error:', error);

        // Handle specific error codes
        let errorMessage = 'Failed to sign in. Please try again.';

        switch (error.code) {
            case 'auth/popup-closed-by-user':
                errorMessage = 'Sign-in cancelled.';
                break;
            case 'auth/popup-blocked':
                errorMessage = 'Sign-in popup was blocked. Please allow popups for this site.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your internet connection.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many sign-in attempts. Please try again later.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
        }

        return {
            success: false,
            user: null,
            error: errorMessage
        };
    }
}

/**
 * Sign out current user
 *
 * @returns {Promise<AuthResult>}
 */
export async function signOut() {
    try {
        console.log('[Auth] Signing out...');
        authState.isLoading = true;

        const auth = getAuth();
        await auth.signOut();

        authState.isLoading = false;

        console.log('[Auth] Sign-out successful');

        return {
            success: true,
            user: null,
            error: null
        };

    } catch (error) {
        authState.isLoading = false;

        console.error('[Auth] Sign-out error:', error);

        return {
            success: false,
            user: null,
            error: 'Failed to sign out. Please try again.'
        };
    }
}

/**
 * Get current authenticated user
 *
 * @returns {User|null}
 */
export function getCurrentUser() {
    return authState.currentUser;
}

/**
 * Check if user is authenticated
 *
 * @returns {boolean}
 */
export function isAuthenticated() {
    return authState.isAuthenticated;
}

/**
 * Check if authentication is loading
 *
 * @returns {boolean}
 */
export function isAuthLoading() {
    return authState.isLoading;
}

/**
 * Get user UID
 *
 * @returns {string|null}
 */
export function getUserId() {
    return authState.currentUser ? authState.currentUser.uid : null;
}

/**
 * Get user email
 *
 * @returns {string|null}
 */
export function getUserEmail() {
    return authState.currentUser ? authState.currentUser.email : null;
}

/**
 * Get user display name
 *
 * @returns {string|null}
 */
export function getUserDisplayName() {
    return authState.currentUser ? authState.currentUser.displayName : null;
}

/**
 * Get user photo URL
 *
 * @returns {string|null}
 */
export function getUserPhotoURL() {
    return authState.currentUser ? authState.currentUser.photoURL : null;
}

/**
 * Wait for auth to be ready (not loading)
 *
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<User|null>}
 */
export function waitForAuth(timeout = 10000) {
    return new Promise((resolve, reject) => {
        if (!authState.isLoading) {
            resolve(authState.currentUser);
            return;
        }

        const timeoutId = setTimeout(() => {
            unsubscribe();
            reject(new Error('Auth initialization timeout'));
        }, timeout);

        const unsubscribe = onAuthStateChange((user, isLoading) => {
            if (!isLoading) {
                clearTimeout(timeoutId);
                unsubscribe();
                resolve(user);
            }
        });
    });
}

/**
 * Refresh current user token
 * Useful for ensuring fresh tokens before critical operations
 *
 * @returns {Promise<string|null>} ID token or null if not authenticated
 */
export async function refreshToken() {
    try {
        const user = getCurrentUser();
        if (!user) {
            return null;
        }

        const token = await user.getIdToken(true); // Force refresh
        console.log('[Auth] Token refreshed');
        return token;

    } catch (error) {
        console.error('[Auth] Token refresh error:', error);
        return null;
    }
}

/**
 * Get current user ID token
 *
 * @param {boolean} forceRefresh - Force token refresh
 * @returns {Promise<string|null>}
 */
export async function getIdToken(forceRefresh = false) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return null;
        }

        return await user.getIdToken(forceRefresh);

    } catch (error) {
        console.error('[Auth] Get ID token error:', error);
        return null;
    }
}
