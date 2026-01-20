# GitHub Pages Deployment Guide

## Overview

Your OAK-Estimator React application is configured to deploy automatically to GitHub Pages at:
**https://babaeti777.github.io/OAK-Estimator/**

## Configuration

The following files have been configured for GitHub Pages deployment:

1. **vite.config.ts** - Updated with `base: '/OAK-Estimator/'` to ensure assets load correctly
2. **.github/workflows/deploy.yml** - Automated build and deployment workflow

## Setup Instructions

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/Babaeti777/OAK-Estimator
2. Click on **Settings** (top navigation)
3. Scroll down and click on **Pages** (left sidebar)
4. Under **Source**, select:
   - Source: **GitHub Actions**
5. Save the changes

### Step 2: Trigger Deployment

The deployment will automatically trigger when you:
- Push changes to the `main` or `master` branch
- Manually trigger the workflow from the Actions tab

To manually trigger:
1. Go to the **Actions** tab in your repository
2. Click on **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select the branch and click **Run workflow**

### Step 3: Verify Deployment

After the workflow completes (usually 2-5 minutes):
1. Go to the **Actions** tab to check the workflow status
2. Once complete, visit: https://babaeti777.github.io/OAK-Estimator/
3. Your application should be live!

## Deployment Workflow

The GitHub Actions workflow automatically:
1. Checks out your code
2. Sets up Node.js 20
3. Installs dependencies (`npm ci`)
4. Builds the React app (`npm run build`)
5. Deploys the built files to GitHub Pages

## Local Development

To test the production build locally:

```bash
cd oak-estimator-react
npm run build
npm run preview
```

This will build and preview the app with the same configuration that will be deployed to GitHub Pages.

## Troubleshooting

### Assets not loading (404 errors)
- Verify the `base` path in `vite.config.ts` matches your repository name
- Should be: `base: '/OAK-Estimator/'`

### Workflow failing
- Check the Actions tab for error details
- Ensure the workflow has proper permissions (Settings → Actions → General → Workflow permissions)
- Verify `package-lock.json` exists in `oak-estimator-react/` directory

### Pages not updating
- Wait a few minutes after workflow completes
- Clear your browser cache
- Check if the workflow completed successfully in the Actions tab

## Custom Domain (Optional)

To use a custom domain:
1. Go to Settings → Pages
2. Enter your custom domain under "Custom domain"
3. Follow GitHub's instructions for DNS configuration
4. Update `vite.config.ts` to use `base: '/'` instead of `base: '/OAK-Estimator/'`

## Notes

- The first deployment may take longer as GitHub sets up the Pages environment
- Subsequent deployments are typically faster
- Only the built files from `oak-estimator-react/dist` are deployed, not the source code
