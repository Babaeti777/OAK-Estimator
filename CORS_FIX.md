# Fix CORS Error for Firebase Storage

## The Error You're Seeing

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' from origin 'https://babaeti777.github.io' has been blocked by CORS policy
```

This means Firebase Storage isn't configured to accept requests from your GitHub Pages domain.

## Quick Fix - Deploy Storage Rules and Configure CORS

Run these commands in order:

### Step 1: Deploy Storage Rules

```bash
cd /home/user/OAK-Estimator
firebase deploy --only storage
```

### Step 2: Configure CORS on Storage Bucket

```bash
# Install Google Cloud SDK if not already installed
# Then run:
gcloud storage buckets update gs://construction-estimator-d2633.firebasestorage.app --cors-file=firebase/cors.json
```

**Alternative:** Use `gsutil` (older tool):

```bash
gsutil cors set firebase/cors.json gs://construction-estimator-d2633.firebasestorage.app
```

## If You Don't Have gcloud/gsutil

You can configure CORS through the Firebase Console:

### Method 1: Using Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/project/construction-estimator-d2633/storage)
2. Click on the **Storage** section
3. Click on the **Rules** tab
4. Make sure the storage rules are deployed (see `firebase/storage.rules`)
5. Go to the **Files** tab
6. Click the three dots (⋮) menu next to your bucket name
7. Select **Edit CORS configuration**
8. Paste this configuration:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "X-Goog-Upload-Header-Content-Length", "X-Goog-Upload-Protocol", "X-Goog-Upload-Command"]
  }
]
```

9. Save

### Method 2: Using Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `construction-estimator-d2633`
3. Go to **Cloud Storage** → **Buckets**
4. Find bucket: `construction-estimator-d2633.firebasestorage.app`
5. Click **Configuration** tab
6. Under **CORS**, click **Edit**
7. Add the CORS configuration above
8. Save

## Verify It's Fixed

1. Clear your browser cache (important!)
2. Refresh the app
3. Try uploading a logo again
4. The CORS error should be gone

## What the CORS Configuration Does

- **origin: ["*"]** - Allows requests from any domain (including GitHub Pages)
- **method** - Allows GET, POST, PUT, DELETE, HEAD requests
- **maxAgeSeconds** - Browser caches CORS preflight for 1 hour
- **responseHeader** - Headers needed for file upload

## Security Note

The `"origin": ["*"]` allows any domain to read your storage files. This is fine for public files like company logos. If you want to restrict it to only your GitHub Pages domain:

```json
"origin": ["https://babaeti777.github.io"],
```

## Still Getting Errors?

1. **Make sure storage rules are deployed:**
   ```bash
   firebase deploy --only storage
   ```

2. **Check if storage is enabled:**
   - Go to Firebase Console → Storage
   - If you see "Get Started", click it to enable Storage

3. **Verify authentication:**
   - Make sure you're logged in
   - Check browser console for auth errors

4. **Clear cache completely:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or clear all browser data for the site
