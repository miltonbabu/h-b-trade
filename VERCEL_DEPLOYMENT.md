# Vercel Deployment Guide

This guide will walk you through the process of deploying the H & B Trade frontend to Vercel.

## Prerequisites

1. **Vercel Account**: Create a free account at [Vercel](https://vercel.com/signup)
2. **Git Repository**: Your project should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Node.js**: Ensure you have Node.js 18.x or later installed locally

## Step 1: Prepare Your Project

### 1.1 Check Frontend Configuration

The frontend is already configured for Vercel deployment. Key files:

- `frontend/package.json` - Contains build scripts
- `frontend/next.config.js` - Contains Next.js configuration
- `frontend/tsconfig.json` - TypeScript configuration

### 1.2 Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
# API URL - use your deployed backend URL
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
```

## Step 2: Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard

1. **Log in to Vercel** and click "New Project"
2. **Import your Git repository**
3. **Configure project settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Environment Variables**: Add `NEXT_PUBLIC_API_URL` with your backend API URL
4. **Click "Deploy"** and wait for the deployment to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

3. **Run Vercel deployment**:
   ```bash
   vercel
   ```

4. **Follow the prompts** to configure your deployment

## Step 3: Configure Environment Variables

After deployment, set up your environment variables in the Vercel dashboard:

1. Go to your project in Vercel
2. Click "Settings" > "Environment Variables"
3. Add the following variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL

## Step 4: Verify Deployment

1. **Check Deployment Status**: Vercel will show you the deployment status and URL
2. **Test the Application**: Open the deployed URL in your browser
3. **Verify API Connection**: Ensure the frontend can communicate with your backend

## Step 5: Custom Domain (Optional)

1. **Add Custom Domain**:
   - Go to your project in Vercel
   - Click "Settings" > "Domains"
   - Add your custom domain

2. **Configure DNS**:
   - Follow Vercel's instructions to update your DNS records
   - Vercel will automatically provision SSL certificates

## Step 6: Continuous Deployment

Vercel automatically sets up continuous deployment from your Git repository. Any changes pushed to your main branch will trigger a new deployment.

## Common Issues

### Dashboard shows 0 for orders / messages / requests after deploy

This means the frontend can't reach the backend. **The most common cause is a missing `NEXT_PUBLIC_API_URL` env var on Vercel** — without it, the build falls back to `http://localhost:5000/api` which a browser on your live domain can't reach.

The admin dashboard will now display a yellow banner identifying this exact misconfiguration, or a red banner with the real error message + the API URL being called.

To fix:

1. In Vercel → your project → **Settings** → **Environment Variables**
2. Add `NEXT_PUBLIC_API_URL` = `https://api.hbtrade.ltd/api` (must include `/api` at the end and the `https://` protocol)
3. Apply to **all** environments (Production, Preview, Development)
4. Trigger a **redeploy** (env-var changes are only picked up by new builds — `NEXT_PUBLIC_*` is baked into the JS bundle at build time)

After redeploy, hard-refresh the admin dashboard. The counts should populate.

### Render backend cold start (free tier)

Render's free tier puts the service to sleep after 15 minutes of inactivity. The first request after sleep can take 30–60 seconds. If the dashboard's red banner says "Network Error" briefly after a quiet period, click **Retry** — the second attempt should succeed.

### CORS errors

If you see `Access-Control-Allow-Origin` errors in the browser console, your backend's `FRONTEND_URL` env var doesn't match the Vercel domain. Set it on Render to the exact origin (e.g. `https://your-app.vercel.app`, no trailing slash) and restart the backend.

### 1. API Connection Issues
- **Solution**: Ensure your backend API is accessible and CORS is properly configured

### 2. Build Failures
- **Solution**: Check your build logs in Vercel for error messages
- Ensure all dependencies are properly installed

### 3. Environment Variables
- **Solution**: Double-check that all required environment variables are set in Vercel

## Monitoring

Vercel provides built-in monitoring tools:
- **Analytics**: Track page views and performance
- **Logs**: View serverless function logs
- **Deployment History**: Track all deployments

## Rollbacks

If you need to rollback to a previous deployment:
1. Go to your project in Vercel
2. Click "Deployments"
3. Select the deployment you want to rollback to
4. Click "Redeploy"

## Support

For Vercel-specific issues, refer to the [Vercel Documentation](https://vercel.com/docs) or contact Vercel support.

---

**Deployment Complete!** Your H & B Trade frontend is now live on Vercel.
