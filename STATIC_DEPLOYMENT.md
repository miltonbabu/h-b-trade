# Static Deployment Guide

This guide will walk you through how to make your frontend static and deploy it to a free static hosting service.

## Step 1: Configure Next.js for Static Export

### 1.1 Update Next.js Configuration

The frontend is already configured for static export. The `next.config.js` file has been updated to use `output: 'export'` instead of `output: 'standalone'`.

### 1.2 Verify No Server-Side Features

The project uses client-side components only, which is compatible with static export. There are no:
- Server-side rendering (getServerSideProps)
- Incremental Static Regeneration
- Next.js API routes
- Server components

## Step 2: Build Static Files

### 2.1 Install Dependencies (if needed)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 2.2 Build Static Site

```bash
# Build the static site
npm run build
```

This will generate a `out` directory with all static files.

## Step 3: Deploy to Free Static Hosting

### Option 1: Netlify (Free)

1. **Create a Netlify account** at [netlify.com](https://www.netlify.com/)
2. **Drag and drop** the `out` directory to Netlify's dashboard
3. **Configure custom domain** (optional)

### Option 2: Vercel (Free)

1. **Create a Vercel account** at [vercel.com](https://vercel.com/)
2. **Import your Git repository**
3. **Set root directory** to `frontend`
4. **Deploy** - Vercel will automatically build and deploy

### Option 3: GitHub Pages (Free)

1. **Push your code** to a GitHub repository
2. **Enable GitHub Pages** in repository settings
3. **Use GitHub Actions** to deploy:
   - Create `.github/workflows/deploy.yml` with:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: cd frontend && npm install
      
      - name: Build static site
        run: cd frontend && npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/out
```

### Option 4: Cloudflare Pages (Free)

1. **Create a Cloudflare account** at [cloudflare.com](https://www.cloudflare.com/)
2. **Connect your Git repository**
3. **Configure build settings**:
   - Build command: `npm run build`
   - Build output directory: `out`
   - Root directory: `frontend`
4. **Deploy**

## Step 4: Configure API Endpoint

### 4.1 Set Environment Variable

Update the `NEXT_PUBLIC_API_URL` environment variable to point to your deployed backend API:

```env
# In .env.local file
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
```

### 4.2 For Vercel/Netlify

Set the environment variable in the hosting provider's dashboard:
- **Vercel**: Settings > Environment Variables
- **Netlify**: Site settings > Build & deploy > Environment

## Step 5: Test Your Static Site

1. **Access the deployed URL**
2. **Test functionality**:
   - Navigation between pages
   - Form submissions (should work via API calls)
   - Cart functionality
   - Any other interactive features

## Step 6: Benefits of Static Deployment

- **Free hosting** on most platforms
- **Faster loading** times
- **Better SEO** (static content is easily indexed)
- **No server costs**
- **High reliability** (static files are served from CDN)

## Step 7: Continuous Deployment

Most static hosting platforms offer automatic deployment when you push changes to your Git repository.

## Troubleshooting

### 1. Build Errors
- **Check dependencies**: Ensure all dependencies are installed
- **Check static compatibility**: Remove any server-side features
- **Check environment variables**: Ensure all required variables are set

### 2. API Connection Issues
- **Verify CORS settings** on your backend
- **Check API URL** in environment variables
- **Test API endpoints** directly

### 3. Routing Issues
- **Next.js static export** creates static files for each route
- **Ensure all routes** are properly generated

## Conclusion

By following this guide, you can deploy your frontend as a static site to a free hosting service, eliminating the need for paid Render hosting while maintaining all functionality.
