#!/bin/bash

# Firebase Deployment Script for OAK Estimator
# This script deploys all Firebase rules and indexes

echo "🚀 Deploying Firebase Rules and Indexes..."
echo ""
echo "This will deploy:"
echo "  ✓ Firestore security rules"
echo "  ✓ Firestore composite indexes"
echo "  ✓ Storage security rules"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not found"
    echo ""
    echo "Install Firebase CLI:"
    echo "  npm install -g firebase-tools"
    echo "  firebase login"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not logged into Firebase"
    echo ""
    echo "Please login:"
    echo "  firebase login"
    exit 1
fi

# Deploy everything
echo "📦 Deploying to Firebase..."
firebase deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "⚠️  IMPORTANT: Configure CORS for Storage"
    echo ""
    echo "To fix CORS errors, run ONE of these commands:"
    echo ""
    echo "Option 1 - Using gcloud (recommended):"
    echo "  gcloud storage buckets update gs://construction-estimator-d2633.firebasestorage.app --cors-file=firebase/cors.json"
    echo ""
    echo "Option 2 - Using gsutil:"
    echo "  gsutil cors set firebase/cors.json gs://construction-estimator-d2633.firebasestorage.app"
    echo ""
    echo "Option 3 - Manual via Firebase Console:"
    echo "  See CORS_FIX.md for detailed instructions"
    echo ""
    echo "Next steps:"
    echo "  1. Configure CORS (see above)"
    echo "  2. Wait 2-10 minutes for indexes to build"
    echo "  3. Check index status: https://console.firebase.google.com/project/construction-estimator-d2633/firestore/indexes"
    echo "  4. Clear browser cache and refresh"
    echo ""
    echo "The app should now connect to the database!"
else
    echo ""
    echo "❌ Deployment failed"
    echo ""
    echo "Check the error message above for details."
    echo "Common issues:"
    echo "  - Not logged in: Run 'firebase login'"
    echo "  - Wrong project: Check .firebaserc file"
    echo "  - Permission denied: Verify your Firebase account has access"
    exit 1
fi
