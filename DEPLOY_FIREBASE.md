# Firebase Deployment Instructions

## Issue: Database Not Connected

If you're seeing "Database is not connected", it means the Firebase rules and/or indexes haven't been deployed yet.

## Quick Fix - Deploy Everything

Run this single command to deploy all Firebase rules and indexes:

```bash
cd /home/user/OAK-Estimator
firebase deploy
```

This will deploy:
- ✅ Firestore security rules
- ✅ Firestore composite indexes
- ✅ Storage security rules (for logo uploads)

## Step-by-Step Deployment

### Option 1: Deploy Everything at Once (Recommended)

```bash
firebase deploy
```

### Option 2: Deploy Individual Components

If you want more control, deploy each component separately:

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Storage rules (for logo uploads)
firebase deploy --only storage
```

## What Gets Deployed

### 1. Firestore Security Rules (`firebase/firestore.rules`)
- Users can only access their own projects
- Validates data structure on writes
- Prevents abuse with size limits

### 2. Firestore Indexes (`firebase/firestore.indexes.json`)
- Compound index for `userId + updatedAt` queries
- Compound index for `userId + createdAt` queries
- Required for project list queries

### 3. Storage Security Rules (`firebase/storage.rules`)
- Users can only upload/delete their own company logos
- 2MB file size limit
- Only image files allowed (PNG, JPG, SVG)

## Verify Deployment

After deployment, verify in Firebase Console:

1. **Firestore Rules**: https://console.firebase.google.com/project/construction-estimator-d2633/firestore/rules
2. **Firestore Indexes**: https://console.firebase.google.com/project/construction-estimator-d2633/firestore/indexes
3. **Storage Rules**: https://console.firebase.google.com/project/construction-estimator-d2633/storage/rules

## Troubleshooting

### Error: "Firebase CLI not found"

Install Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
```

### Error: "Permission denied"

Make sure you're logged in:
```bash
firebase login
firebase projects:list  # Verify you can see your project
```

### Error: "Index already exists"

This is OK - Firebase will skip existing indexes. Just continue.

### Deployment Takes Long Time

- Firestore indexes can take 2-10 minutes to build
- You'll see a message like "Index building... This may take a few minutes"
- The app will work once indexes are ACTIVE

## Check Index Build Status

```bash
# In Firebase Console > Firestore > Indexes
# Status should be: "Enabled" (not "Building")
```

## After Deployment

Once deployment completes:
1. Refresh your app
2. The "Database is not connected" error should be gone
3. You can create projects and upload logos

## Quick Test

1. Run the app: `npm run dev`
2. Login with Google
3. Create a project - should work immediately
4. Upload a company logo - should work if storage rules are deployed
