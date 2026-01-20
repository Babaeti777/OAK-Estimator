# Deploying Firestore Configuration

## Issues Fixed

### 1. Security Rules
The Firestore security rules have been updated to match your actual data structure:
- Changed `updatedAt` and `createdAt` from `string` to `number`
- Updated validation to check for actual Project fields: `userId`, `companySettings`, `projectSettings`, `lineItems`
- Removed invalid field checks for `id`, `name`, and `type`

### 2. Composite Index
A composite index is required for querying projects by `userId` and ordering by `updatedAt`.
The index configuration already exists in `firebase/firestore.indexes.json`.

## Quick Fix (Easiest)

Click this link to automatically create the required index:
[Create Composite Index](https://console.firebase.google.com/v1/r/project/construction-estimator-d2633/firestore/indexes?create_composite=Cl1wcm9qZWN0cy9jb25zdHJ1Y3Rpb24tZXN0aW1hdG9yLWQyNjMzL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9wcm9qZWN0cy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoNCgl1cGRhdGVkQXQQAhoMCghfX25hbWVfXhAC)

**Then** deploy the security rules using the Firebase CLI or manual method below.

## Deploy via Firebase CLI (Recommended)

1. **Authenticate with Firebase:**
   ```bash
   firebase login
   ```

2. **Deploy both rules AND indexes:**
   ```bash
   firebase deploy --only firestore
   ```

   Or deploy them separately:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

3. **Verify deployment:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `construction-estimator-d2633`
   - Navigate to **Firestore Database** > **Rules** - Verify the rules have been updated
   - Navigate to **Firestore Database** > **Indexes** - Wait for the index to finish building (may take a few minutes)

## Deploy via Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `construction-estimator-d2633`
3. Navigate to **Firestore Database** > **Rules**
4. Copy the contents of `firebase/firestore.rules`
5. Paste into the Firebase Console editor
6. Click **Publish**

## Testing

After deployment, the following operations should work:
- ✅ Creating new projects (requires authentication)
- ✅ Reading user's own projects
- ✅ Updating user's own projects
- ✅ Deleting user's own projects
- ✅ Real-time subscriptions to projects

The errors you were seeing should be resolved once the rules are deployed.
