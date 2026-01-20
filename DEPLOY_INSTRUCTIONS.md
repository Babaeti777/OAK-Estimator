# Deploying Firestore Security Rules

## Issue Fixed
The Firestore security rules have been updated to match your actual data structure:
- Changed `updatedAt` and `createdAt` from `string` to `number`
- Updated validation to check for actual Project fields: `userId`, `companySettings`, `projectSettings`, `lineItems`
- Removed invalid field checks for `id`, `name`, and `type`

## Deploy via Firebase CLI

1. **Authenticate with Firebase:**
   ```bash
   firebase login
   ```

2. **Deploy the rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Verify deployment:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `construction-estimator-d2633`
   - Navigate to Firestore Database > Rules
   - Verify the rules have been updated

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
