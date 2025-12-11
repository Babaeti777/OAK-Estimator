# Firebase Integration for OAK Construction Estimator

## 🎯 Overview

This directory contains a complete, redesigned Firebase integration with modern best practices, improved error handling, offline support, and intelligent sync management.

## ✨ Key Features

### Architecture Improvements
- ✅ **Modular SDK (v9+)** - Smaller bundle size, better tree-shaking
- ✅ **Service Layer Architecture** - Clean separation of concerns
- ✅ **TypeScript-ready** - Full JSDoc type annotations
- ✅ **Error Recovery** - Automatic retry with exponential backoff
- ✅ **Offline-First** - Works seamlessly offline with local storage fallback

### Enhanced Capabilities
- ✅ **Smart Conflict Resolution** - Multiple merge strategies (Latest Wins, Server Wins, Local Wins, Intelligent Merge)
- ✅ **Connection Monitoring** - Real-time network and Firestore status tracking
- ✅ **Sync Queue** - Prevents sync loops and manages concurrent operations
- ✅ **Real-time Sync** - Automatic cross-device synchronization
- ✅ **Comprehensive Logging** - Detailed error tracking and debugging tools

---

## 📁 File Structure

```
firebase/
├── config.js                 # Firebase configuration (⚠️ UPDATE THIS FIRST)
├── firebase-init.js          # Firebase initialization and setup
├── auth-service.js           # Authentication service (Google OAuth)
├── firestore-service.js      # Firestore data operations
├── sync-manager.js           # Sync coordination and conflict resolution
├── connection-monitor.js     # Network and Firestore connectivity monitoring
├── error-handler.js          # Error handling and logging utilities
├── index.js                  # Main entry point (import this)
├── firestore.rules           # Security rules template
└── README.md                 # This file
```

---

## 🚀 Quick Start Guide

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `oak-estimator-[your-name]` (or your preferred name)
4. Enable/disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google** provider
3. Toggle **Enable**
4. Add support email
5. Click **Save**

### Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **Production mode** (we'll add rules next)
4. Select your preferred location
5. Click **Enable**

### Step 4: Deploy Security Rules

1. In Firebase Console, go to **Firestore Database** > **Rules**
2. Copy the contents of `firebase/firestore.rules`
3. Paste into the rules editor
4. Click **Publish**

### Step 5: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web** icon (`</>`)
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

### Step 6: Update Configuration

1. Open `firebase/config.js`
2. Find the `firebaseConfig` object (around line 30)
3. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};
```

### Step 7: Add Firebase SDK to HTML

Add the following in your `index.html` before closing `</body>` tag:

```html
<!-- Firebase SDK (compat version) -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

<!-- Firebase Integration Module -->
<script type="module">
    import { initializeApp, signInWithGoogle, signOut } from './firebase/index.js';

    // Initialize Firebase
    const result = await initializeApp({
        onAuthChange: (user, isLoading) => {
            console.log('Auth changed:', user?.email || 'No user');
            // Update your UI here
        },
        onConnectionChange: (status) => {
            console.log('Connection status:', status);
            // Update your UI here
        },
        onSyncUpdate: (projects, metadata) => {
            console.log('Projects synced:', projects.length);
            // Update your UI here
        }
    });

    if (!result.success) {
        console.error('Firebase initialization failed:', result.error);
    }
</script>
```

---

## 📖 Usage Guide

### Basic Usage with Quick Setup

The simplest way to use the Firebase integration:

```javascript
import { quickSetup } from './firebase/index.js';

// Initialize
const app = await quickSetup({
    onAuthChange: (user) => {
        updateUI(user);
    },
    onSyncUpdate: (projects) => {
        displayProjects(projects);
    }
});

// Sign in
await app.signIn();

// Load projects
const projects = await app.loadProjects();

// Save projects
await app.saveProjects(projects);

// Sign out
await app.signOut();

// Cleanup (when app closes)
app.cleanup();
```

### Advanced Usage

For more control, use individual services:

#### Authentication

```javascript
import {
    signInWithGoogle,
    signOut,
    getCurrentUser,
    isAuthenticated,
    onAuthStateChange
} from './firebase/index.js';

// Sign in with Google
const result = await signInWithGoogle();
if (result.success) {
    console.log('Signed in as:', result.user.email);
} else {
    console.error('Sign-in failed:', result.error);
}

// Listen to auth changes
const unsubscribe = onAuthStateChange((user, isLoading) => {
    if (!isLoading) {
        if (user) {
            console.log('User signed in:', user.email);
        } else {
            console.log('User signed out');
        }
    }
});

// Sign out
await signOut();
```

#### Project Data Management

```javascript
import {
    fetchUserProjects,
    saveUserProjects,
    subscribeToUserProjects
} from './firebase/index.js';

// Fetch projects once
const result = await fetchUserProjects();
if (result.success) {
    const projects = result.data.projects || [];
    console.log('Loaded projects:', projects);
}

// Save projects
await saveUserProjects([
    {
        id: '1',
        name: 'My Project',
        type: 'Commercial',
        updatedAt: new Date().toISOString(),
        lineItems: []
    }
]);

// Real-time sync
const unsubscribe = subscribeToUserProjects(
    (projects, metadata) => {
        console.log('Projects updated:', projects.length);
        console.log('From cache:', metadata.fromCache);
    },
    (error) => {
        console.error('Sync error:', error);
    }
);
```

#### Sync Management

```javascript
import {
    syncToCloud,
    syncFromCloud,
    loadLocalProjects,
    saveLocalProjects,
    setConflictStrategy,
    CONFLICT_STRATEGY
} from './firebase/index.js';

// Set conflict resolution strategy
setConflictStrategy(CONFLICT_STRATEGY.LATEST_WINS);

// Sync to cloud
const projects = loadLocalProjects();
const result = await syncToCloud(projects);

// Sync from cloud (with merge)
const result = await syncFromCloud(true);
if (result.success) {
    const mergedProjects = result.projects;
    saveLocalProjects(mergedProjects);
}
```

#### Connection Monitoring

```javascript
import {
    onConnectionChange,
    isOnline,
    isFullyConnected,
    pingTest
} from './firebase/index.js';

// Listen to connection changes
const unsubscribe = onConnectionChange((status) => {
    console.log('Online:', status.isOnline);
    console.log('Firestore connected:', status.isFirestoreConnected);
});

// Check connection
if (isFullyConnected()) {
    console.log('Fully connected to internet and Firestore');
}

// Test connectivity
const connected = await pingTest();
console.log('Ping test:', connected ? 'success' : 'failed');
```

#### Error Handling

```javascript
import {
    handleError,
    logger,
    showNotification,
    setNotificationHandler
} from './firebase/index.js';

// Custom notification handler
setNotificationHandler((message, type) => {
    // Show in your UI (toast, modal, etc.)
    showToast(message, type);
});

// Handle errors with logging
try {
    await someOperation();
} catch (error) {
    const userMessage = handleError(error, 'Save Project');
    showNotification(userMessage, 'error');
}

// Use logger
logger.info('Project saved successfully');
logger.warn('Cache is getting full');
logger.error('Failed to sync', { errorCode: 'SYNC_001' });
```

---

## 🔧 Configuration Options

### Conflict Resolution Strategies

Choose how to handle conflicts when local and remote data differ:

```javascript
import { setConflictStrategy, CONFLICT_STRATEGY } from './firebase/index.js';

// Server always wins (use remote data)
setConflictStrategy(CONFLICT_STRATEGY.SERVER_WINS);

// Local always wins (use local data)
setConflictStrategy(CONFLICT_STRATEGY.LOCAL_WINS);

// Latest timestamp wins (default)
setConflictStrategy(CONFLICT_STRATEGY.LATEST_WINS);

// Intelligent merge (merge fields intelligently)
setConflictStrategy(CONFLICT_STRATEGY.MERGE);
```

### Logging Configuration

```javascript
import { setLogLevel, setLogStorage, LOG_LEVEL } from './firebase/index.js';

// Set minimum log level
setLogLevel(LOG_LEVEL.DEBUG); // Show all logs
setLogLevel(LOG_LEVEL.INFO);  // Show info and above
setLogLevel(LOG_LEVEL.ERROR); // Show errors only

// Enable log storage (for debugging)
setLogStorage(true);

// Export logs
import { downloadLogs } from './firebase/index.js';
downloadLogs(); // Downloads JSON file
```

---

## 🔐 Security

### Firestore Security Rules

The provided security rules ensure:
- ✅ Users can only access their own data
- ✅ All operations require authentication
- ✅ Data structure validation
- ✅ Size limits to prevent abuse

### API Key Security

The Firebase API key in `config.js` is safe to expose publicly because:
1. It's only used for client identification
2. Security is enforced by Firestore Security Rules
3. Firebase automatically restricts it to your domain

**Optional:** You can restrict your API key in Firebase Console:
1. Go to **APIs & Services** > **Credentials**
2. Click your API key
3. Add restrictions (HTTP referrers, IP addresses, etc.)

---

## 🧪 Testing

### Test Firebase Connection

```javascript
import { initializeFirebase } from './firebase/index.js';

const result = await initializeFirebase();
console.log('Firebase initialized:', result);
```

### Test Authentication

```javascript
import { signInWithGoogle } from './firebase/index.js';

const result = await signInWithGoogle();
if (result.success) {
    console.log('✅ Auth working!');
} else {
    console.error('❌ Auth failed:', result.error);
}
```

### Test Sync

```javascript
import { syncToCloud, syncFromCloud } from './firebase/index.js';

// Save test data
const testProjects = [{ id: '1', name: 'Test', type: 'Test', updatedAt: new Date().toISOString(), lineItems: [] }];
const saveResult = await syncToCloud(testProjects);
console.log('Save:', saveResult.success ? '✅' : '❌');

// Load data back
const loadResult = await syncFromCloud(false);
console.log('Load:', loadResult.success ? '✅' : '❌');
console.log('Projects:', loadResult.projects);
```

---

## 🐛 Troubleshooting

### "Firebase configuration not set"
- Check that you've updated `firebase/config.js` with your actual Firebase credentials
- Ensure all fields are filled (not "YOUR_API_KEY_HERE")

### "Permission denied"
- Verify you've deployed the security rules from `firestore.rules`
- Ensure user is authenticated before accessing Firestore

### "Popup blocked"
- The sign-in popup was blocked by browser
- User needs to allow popups for your site

### "Network error"
- Check internet connection
- The app will work offline and sync when connection restored

### "Offline persistence failed: Multiple tabs"
- Expected when multiple tabs are open
- Offline caching will work in one tab

---

## 📊 Performance Optimization

### Reduce Firestore Reads

```javascript
// Use local storage for frequent reads
const projects = loadLocalProjects();

// Only sync periodically or on user action
await syncFromCloud(true);
```

### Batch Operations

```javascript
import { batchWrite } from './firebase/index.js';

await batchWrite([
    { type: 'set', collection: 'userProjects', docId: userId, data: projectData },
    { type: 'update', collection: 'userSettings', docId: userId, data: settings }
]);
```

---

## 🔄 Migration from Old Integration

If migrating from the previous Firebase integration:

1. **Backup existing data**: Export projects from current system
2. **Update config**: Add Firebase credentials to `firebase/config.js`
3. **Replace imports**: Update HTML to use new modular system
4. **Test**: Verify data loads correctly
5. **Deploy**: Push changes to production

The new system is backward compatible with the existing data structure.

---

## 📚 API Reference

See individual service files for detailed documentation:

- **config.js** - Firebase configuration
- **firebase-init.js** - Initialization and setup
- **auth-service.js** - Authentication methods
- **firestore-service.js** - Database operations
- **sync-manager.js** - Synchronization logic
- **connection-monitor.js** - Network monitoring
- **error-handler.js** - Error utilities

All functions include JSDoc type annotations for IDE autocomplete.

---

## 🤝 Support

For issues or questions:
1. Check this README
2. Review console logs (with debug logging enabled)
3. Export and review logs using `downloadLogs()`
4. Check Firebase Console for errors

---

## 📝 License

This Firebase integration is part of the OAK Construction Estimator project.

---

**Last Updated**: December 2025
**Firebase SDK Version**: 10.7.1
**Author**: Claude AI Assistant
