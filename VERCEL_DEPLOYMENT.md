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
