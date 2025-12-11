/**
 * Firebase Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication > Sign-in method > Google
 * 3. Enable Firestore Database
 * 4. Copy your Firebase config and replace the placeholder below
 * 5. Deploy the security rules from firebase/security-rules.txt
 */

/**
 * @typedef {Object} FirebaseConfig
 * @property {string} apiKey - Firebase API Key
 * @property {string} authDomain - Firebase Auth Domain
 * @property {string} projectId - Firebase Project ID
 * @property {string} storageBucket - Firebase Storage Bucket
 * @property {string} messagingSenderId - Firebase Messaging Sender ID
 * @property {string} appId - Firebase App ID
 * @property {string} [measurementId] - Google Analytics Measurement ID (optional)
 */

/**
 * Firebase Configuration Object
 *
 * REPLACE THIS WITH YOUR FIREBASE PROJECT CONFIGURATION:
 * Go to: Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
 *
 * @type {FirebaseConfig}
 */
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

/**
 * Firestore Collection Names
 */
const COLLECTIONS = {
    USER_PROJECTS: 'userProjects',
    USER_SETTINGS: 'userSettings',
    SYNC_METADATA: 'syncMetadata'
};

/**
 * Firebase SDK Version
 * Using modular v9+ SDK for better tree-shaking and smaller bundle size
 */
const FIREBASE_SDK_VERSION = '10.7.1';

/**
 * CDN URLs for Firebase SDK modules
 */
const FIREBASE_CDN = {
    APP: `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`,
    AUTH: `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth.js`,
    FIRESTORE: `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`
};

/**
 * Configuration validation
 * @returns {boolean} True if config is properly set
 */
function isConfigValid() {
    return firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" &&
           firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
           firebaseConfig.apiKey.length > 0;
}

/**
 * Get Firebase configuration
 * @returns {FirebaseConfig}
 * @throws {Error} If configuration is not properly set
 */
export function getFirebaseConfig() {
    if (!isConfigValid()) {
        throw new Error(
            'Firebase configuration not set. Please update firebase/config.js with your Firebase project credentials.'
        );
    }
    return firebaseConfig;
}

/**
 * Get collection name
 * @param {keyof COLLECTIONS} collectionKey
 * @returns {string}
 */
export function getCollectionName(collectionKey) {
    return COLLECTIONS[collectionKey];
}

/**
 * Export configuration objects
 */
export { firebaseConfig, COLLECTIONS, FIREBASE_CDN, FIREBASE_SDK_VERSION };
