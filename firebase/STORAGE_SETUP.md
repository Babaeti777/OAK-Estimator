# Firebase Storage Setup Instructions

## Deploy Storage Rules

To enable logo upload functionality, you need to deploy the Storage security rules to Firebase.

### Option 1: Using Firebase CLI (Recommended)

```bash
# Navigate to the project root
cd /path/to/OAK-Estimator

# Deploy storage rules only
firebase deploy --only storage

# Or deploy everything (storage, firestore, etc.)
firebase deploy
```

### Option 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `construction-estimator-d2633`
3. Navigate to **Storage** in the left menu
4. Click on the **Rules** tab
5. Copy the contents of `firebase/storage.rules`
6. Paste into the rules editor
7. Click **Publish**

## Storage Rules Explanation

The rules allow:
- **Read**: Any authenticated user can read logos
- **Write**: Users can only upload logos to their own folder (`company-logos/{userId}/`)
- **File Size**: Maximum 2MB per file
- **File Type**: Only image files (png, jpg, svg, etc.)
- **Delete**: Users can only delete their own logos

## Verify Setup

After deploying, test the logo upload:
1. Log into the app
2. Click your profile avatar → Company Settings
3. Upload a company logo (PNG, JPG, or SVG, max 2MB)
4. Verify it appears in your profile and next to project settings

## Troubleshooting

If logo upload fails:
1. Check browser console for error messages
2. Verify storage rules are deployed
3. Ensure user is authenticated
4. Check file size is under 2MB
5. Verify file format is image/png, image/jpeg, or image/svg+xml
