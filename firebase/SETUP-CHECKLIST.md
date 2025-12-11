# Firebase Setup Checklist

Use this checklist to ensure your Firebase integration is properly configured.

## ☑️ Prerequisites

- [ ] You have a Google account
- [ ] You have access to [Firebase Console](https://console.firebase.google.com)
- [ ] You have the OAK Estimator codebase

---

## 📋 Firebase Console Setup

### 1. Create Firebase Project
- [ ] Go to Firebase Console
- [ ] Click "Add project"
- [ ] Enter project name
- [ ] Create project

**Project Name:** ________________________________

### 2. Enable Google Authentication
- [ ] Navigate to Authentication section
- [ ] Go to Sign-in method tab
- [ ] Enable Google provider
- [ ] Add support email
- [ ] Save configuration

**Support Email:** ________________________________

### 3. Create Firestore Database
- [ ] Navigate to Firestore Database
- [ ] Click "Create database"
- [ ] Select Production mode
- [ ] Choose location
- [ ] Enable database

**Database Location:** ________________________________

### 4. Deploy Security Rules
- [ ] Open Firestore Database > Rules
- [ ] Copy content from `firebase/firestore.rules`
- [ ] Paste into rules editor
- [ ] Click "Publish"
- [ ] Verify rules are active

### 5. Register Web App
- [ ] Go to Project Settings
- [ ] Scroll to "Your apps"
- [ ] Click Web icon (`</>`)
- [ ] Enter app nickname
- [ ] Register app

**App Nickname:** ________________________________

---

## 🔧 Code Configuration

### 6. Get Firebase Configuration
- [ ] Copy the `firebaseConfig` object from Firebase Console
- [ ] Open `firebase/config.js` in your code
- [ ] Replace placeholder values with your actual config

```javascript
const firebaseConfig = {
    apiKey: "...",              // ✓ Updated
    authDomain: "...",          // ✓ Updated
    projectId: "...",           // ✓ Updated
    storageBucket: "...",       // ✓ Updated
    messagingSenderId: "...",   // ✓ Updated
    appId: "..."                // ✓ Updated
};
```

**Verification:**
- [ ] `apiKey` does not contain "YOUR_API_KEY_HERE"
- [ ] `projectId` matches your Firebase project
- [ ] `authDomain` ends with `.firebaseapp.com`

### 7. Add Firebase SDK to HTML
- [ ] Open `index.html`
- [ ] Add Firebase SDK scripts before `</body>`
- [ ] Add integration module script

**Location in HTML:** Line _______ (approximately)

### 8. Initialize Firebase Integration
- [ ] Import `initializeApp` or `quickSetup` from `./firebase/index.js`
- [ ] Call initialization function
- [ ] Add callbacks for auth, connection, and sync

---

## ✅ Testing

### 9. Test Firebase Initialization
- [ ] Open browser console (F12)
- [ ] Load the application
- [ ] Check for "[Firebase] Initialization complete" message
- [ ] Verify no errors in console

**Console Output:**
```
[ ] [Firebase] Starting initialization...
[ ] [Firebase] Initializing app...
[ ] [Firebase] Initializing authentication...
[ ] [Firebase] Initializing Firestore...
[ ] [Firebase] Offline persistence enabled
[ ] [Firebase] Initialization complete
```

### 10. Test Google Sign-In
- [ ] Click sign-in button in your app
- [ ] Google popup appears
- [ ] Select Google account
- [ ] Sign-in completes successfully
- [ ] User info displays in UI

**Test User Email:** ________________________________

### 11. Test Project Sync
- [ ] Create a test project
- [ ] Save project
- [ ] Verify "[SyncManager] Sync to cloud successful" in console
- [ ] Go to Firestore in Firebase Console
- [ ] Verify document exists in `userProjects` collection

**Document ID (User ID):** ________________________________

### 12. Test Cross-Device Sync
- [ ] Sign in on Device 1
- [ ] Create/modify a project
- [ ] Sign in on Device 2 (or another browser)
- [ ] Verify project appears automatically

**Devices Tested:**
- [ ] Device 1: ________________________________
- [ ] Device 2: ________________________________

### 13. Test Offline Mode
- [ ] Sign in and load projects
- [ ] Disconnect from internet (disable WiFi/network)
- [ ] Create/modify a project
- [ ] Verify "offline" indicator in UI (if implemented)
- [ ] Reconnect to internet
- [ ] Verify project syncs automatically

**Offline Test Results:**
- [ ] App works offline
- [ ] Projects load from cache
- [ ] Changes persist locally
- [ ] Auto-sync on reconnect

### 14. Test Sign-Out
- [ ] Click sign-out button
- [ ] Confirm sign-out
- [ ] User data clears
- [ ] Returns to offline/guest mode

---

## 🔒 Security Verification

### 15. Security Rules Active
- [ ] Go to Firestore > Rules in Firebase Console
- [ ] Verify rules are published
- [ ] Rules show recent publish timestamp
- [ ] Test: Try to access another user's data (should fail)

### 16. API Key Restrictions (Optional)
- [ ] Go to Google Cloud Console
- [ ] Navigate to APIs & Services > Credentials
- [ ] Find your API key
- [ ] Add HTTP referrer restrictions
- [ ] Add your domain(s)

**Domains Added:**
- [ ] ________________________________
- [ ] ________________________________

---

## 📊 Performance Check

### 17. Console Logs Review
- [ ] No error messages
- [ ] No excessive warning messages
- [ ] Sync operations complete quickly
- [ ] No repeated/looping operations

### 18. Network Tab Review
- [ ] Open browser DevTools > Network
- [ ] Load application
- [ ] Check Firebase requests
- [ ] Verify reasonable request count
- [ ] Check response times

**Average Response Time:** _______ ms

---

## 📱 Production Readiness

### 19. Error Handling
- [ ] Test with network errors (disconnect during sync)
- [ ] Test with invalid data
- [ ] Test with popup blockers enabled
- [ ] Verify user-friendly error messages display

### 20. Logging Configuration
- [ ] Set appropriate log level for production
- [ ] Disable debug logging if not needed
- [ ] Test log export functionality

```javascript
setLogLevel(LOG_LEVEL.INFO); // or LOG_LEVEL.ERROR for production
```

### 21. Final Verification
- [ ] All features work as expected
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] UI updates correctly
- [ ] Data persists correctly

---

## 🎉 Launch Checklist

### Pre-Launch
- [ ] All above tests passed
- [ ] Code reviewed
- [ ] Security rules verified
- [ ] Backup of existing data (if migrating)

### Launch
- [ ] Deploy to production
- [ ] Monitor Firebase Console for errors
- [ ] Monitor application logs
- [ ] Test with real users

### Post-Launch
- [ ] Monitor Firestore usage
- [ ] Check Firebase billing (if applicable)
- [ ] Collect user feedback
- [ ] Address any issues

---

## 📞 Support Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Firebase Console**: https://console.firebase.google.com
- **Firestore Docs**: https://firebase.google.com/docs/firestore
- **Auth Docs**: https://firebase.google.com/docs/auth

---

## ✍️ Notes

Use this space for any additional notes during setup:

```
_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________
```

---

**Setup Date:** ________________________________

**Setup By:** ________________________________

**Firebase Project ID:** ________________________________

**Status:** [ ] In Progress  [ ] Complete  [ ] Issues

---

**Last Updated**: December 2025
