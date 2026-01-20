# Firestore Setup Guide

## Overview

This guide will help you properly configure Firebase Firestore for the OAK Estimator application, including security rules and indexes.

## Prerequisites

- Firebase project created (construction-estimator-d2633)
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged into Firebase: `firebase login`

## Step 1: Deploy Firestore Security Rules

The security rules control who can read and write data in Firestore.

### Option A: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `construction-estimator-d2633`
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Copy and paste the contents of `firebase/firestore.rules`
6. Click **Publish**

### Option B: Using Firebase CLI

```bash
# From the project root directory
firebase deploy --only firestore:rules
```

## Step 2: Deploy Firestore Indexes

Indexes are required for compound queries (queries with multiple where/orderBy clauses).

### Option A: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `construction-estimator-d2633`
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Indexes** tab
5. Click **Add Index** and create the following indexes:

#### Index 1: User Projects by Update Time
- **Collection ID**: `projects`
- **Fields**:
  - `userId` - Ascending
  - `updatedAt` - Descending
- **Query scope**: Collection

#### Index 2: User Projects by Creation Time
- **Collection ID**: `projects`
- **Fields**:
  - `userId` - Ascending
  - `createdAt` - Descending
- **Query scope**: Collection

### Option B: Using Firebase CLI (Recommended)

```bash
# From the project root directory
firebase deploy --only firestore:indexes
```

This will automatically create the indexes defined in `firebase/firestore.indexes.json`.

### Option C: Auto-create from Error Link

When you run the app, if an index is missing, Firestore will show an error with a link to auto-create the index. Simply click the link in the browser console.

## Step 3: Verify Setup

### Test Security Rules

1. Open your app in a browser
2. Try to sign in with Google authentication
3. Create a test project
4. Verify you can:
   - ✅ Create new projects
   - ✅ Read your own projects
   - ✅ Update your own projects
   - ✅ Delete your own projects
   - ❌ NOT read other users' projects (security working!)

### Test Indexes

1. Create multiple projects
2. Verify they appear sorted by most recently updated
3. Check browser console - should be NO errors about missing indexes

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Solution**: Check that your security rules are deployed correctly. Users must be authenticated to access data.

### Error: "The query requires an index"

**Solution**: Deploy the indexes using one of the methods above, or click the auto-create link in the error message.

### Error: "Invalid property path '__name_^'" OR "The query requires an index"

This error can occur if:

1. **Firestore rules haven't been deployed yet**
   - Solution: Deploy rules using Firebase Console or CLI

2. **Indexes haven't been created yet**
   - Solution: Deploy indexes using the methods above
   - Or: Wait for auto-create from error link

3. **Index is currently building** ⏳
   - Error message: "That index is currently building and cannot be used yet"
   - This is NORMAL! Firebase is creating your index
   - **Solution: Just wait 2-10 minutes for the build to complete**
   - You can check status by clicking the link in the error message
   - Refresh the page after a few minutes and the error will be gone

4. **Rules have syntax errors**
   - Solution: Verify `firebase/firestore.rules` matches the template
   - Check for typos in field names

5. **Browser cache issues**
   - Solution: Clear browser cache and reload
   - Or: Try in incognito/private window

### Error: "failed-precondition" or "FAILED_PRECONDITION"

**Solution**: This means an index is missing. Deploy indexes or use the auto-create link.

## Collections Structure

### projects
Each project document contains:
```json
{
  "id": "auto-generated-id",
  "userId": "user-auth-id",
  "companySettings": {
    "name": "Company Name",
    "address": "123 Main St",
    "phone": "555-0100",
    "email": "contact@company.com"
  },
  "projectSettings": {
    "projectName": "Office Building",
    "projectNumber": "2024-001",
    "location": "City, State",
    "architect": "Architect Name",
    "estimator": "Estimator Name",
    "date": "2024-01-20"
  },
  "lineItems": [
    {
      "id": "item-1",
      "division": "03",
      "type": "material",
      "description": "Concrete",
      "quantity": 100,
      "unit": "CY",
      "unitCost": 150,
      "totalCost": 15000
    }
  ],
  "createdAt": 1705737600000,
  "updatedAt": 1705737600000
}
```

### userSettings (Optional)
User preferences and settings.

### syncMetadata (Optional)
Sync status and metadata.

## Security Model

- ✅ Users can only access their own data
- ✅ All operations require authentication
- ✅ Data validation on writes
- ✅ Size limits (1MB per document)
- ❌ No public access
- ❌ No cross-user data access

## Next Steps

After setup:

1. **Test locally**: Run the app and create test projects
2. **Deploy to production**: Build and deploy your app
3. **Monitor usage**: Check Firebase Console for usage metrics
4. **Set up billing alerts**: Enable billing alerts in Firebase Console

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
