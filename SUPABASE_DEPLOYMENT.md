# Supabase + Vercel Deployment Guide

This guide explains how to deploy H&B Trade using **Supabase** (Backend + Database) and **Vercel** (Frontend), while keeping all existing Render deployment files intact.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION SETUP                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐     ┌──────────────────────────────────┐  │
│  │   VERCEL     │     │          SUPABASE                │  │
│  │  (Frontend)  │────▶│  ┌──────────┐  ┌──────────────┐  │  │
│  │   Next.js    │ API │  │ Postgres │  │  Backend API  │  │  │
│  │              │◀────│  │  Database │  │  (Edge Func)  │  │  │
│  └──────────────┘     │  └──────────┘  └──────────────┘  │  │
│                       │                                    │  │
│                       └──────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              RENDER (PRESERVED)                      │   │
│  │  render.yaml + Dockerfiles - Keep as backup         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Options

### Option A: Full Supabase Stack (Recommended)
- **Database**: Supabase PostgreSQL (free tier: 500MB, generous)
- **Backend**: Supabase Edge Functions (Deno-based, auto-scale)
- **Frontend**: **Vercel** (Next.js optimized)
- **Auth**: Supabase Auth (optional upgrade)
- **Storage**: Supabase Storage (for file uploads)

### Option B: Hybrid - Supabase DB Only
- **Database**: Supabase PostgreSQL
- **Backend**: Render / Railway / Your existing setup
- **Frontend**: **Vercel**
- **Auth**: Keep existing JWT system

### Option C: Keep Both Environments
- **Render**: Existing full-stack deployment (backup/alternative)
- **Supabase + Vercel**: New primary deployment

---

## Step-by-Step Deployment

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Configure:
   - **Name**: `hbtrade-production`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (Northeast Asia recommended for Bangladesh/China trade)
   - **Plan**: Free tier (start here)

4. Wait for project to initialize (~2 minutes)

### Step 2: Get Supabase Connection Details

After project creation, go to:

**Settings > Database**:
```
Connection string (URI):
postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

Direct URL (for server-side):
postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].supabase.com:5432/postgres
```

**Settings > API**:
```
Project URL: https://[YOUR-PROJECT-REF].supabase.co
anon key: eyJ...
service_role key: eyJ...
JWT Secret: (long string in "JWT Secret" field)
```

> Save all these values! You'll need them for environment variables.

### Step 3: Initialize Database Schema

#### Option A: Using Supabase SQL Editor (Easiest)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy contents from `database/schema.sql` and paste
4. Click **Run**

#### Option B: Using CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref [YOUR-PROJECT-REF]

# Run migration
supabase db push
```

#### Option C: Using psql directly

```bash
psql "postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].supabase.com:5432/postgres" < database/schema.sql
```

### Step 4: Set Up Row Level Security (RLS)

In Supabase SQL Editor, run:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow service_role to bypass RLS (for backend API)
CREATE POLICY "Service role can do everything" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Repeat for other tables as needed, or use a universal approach
```

### Step 5: Deploy Backend to Supabase Edge Functions

#### 5.1 Install Supabase CLI (if not done)

```bash
npm install -g supabase
```

#### 5.2 Initialize Supabase Functions

```bash
# In your project root
supabase functions init api --no-interactive-js
```

#### 5.3 Create Edge Function

Create `supabase/functions/api/index.ts`:

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createServer } from 'node:http'

// Import your Express app - you'll need to adapt this
// For now, we'll use a simpler approach with Deno serve

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }

  const url = new URL(req.url)
  
  // Health check
  if (url.pathname === '/api/health') {
    return Response.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: 'supabase-edge'
    })
  }

  return new Response('API endpoint', { status: 200 })
})
```

#### 5.4 Deploy Edge Function

```bash
supabase functions deploy api --env-file ./backend/.env.supabase.example
```

### Alternative: Deploy Backend to Render/Railway (Keep Express.js)

If you prefer to keep your existing Express.js backend unchanged:

1. Deploy backend to **Render** (using existing `render.yaml` or Dockerfile)
2. Just change `DATABASE_URL` to point to Supabase
3. Set environment variable in Render dashboard:
   ```
   DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].supabase.com:5432/postgres
   ```

### Step 6: Deploy Frontend to Vercel

#### 6.1 Connect to Vercel

**Via Dashboard:**
1. Go to [vercel.com](https://vercel.com) and login
2. Click **"New Project"**
3. Import your GitHub repository
4. Set **Root Directory** to `frontend`
5. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

**Via CLI:**
```bash
cd frontend
npm install -g vercel
vercel
```

#### 6.2 Set Environment Variables in Vercel

Go to: **Settings > Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://[YOUR-PROJECT-REF].supabase.co/functions/v1/api` (if using Edge Functions) OR `https://your-backend.onrender.com/api` (if using Render backend) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[YOUR-PROJECT-REF].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key from Supabase |

> **Important**: Variables starting with `NEXT_PUBLIC_` are embedded at build time. After adding them, **trigger a redeploy**.

#### 6.3 Redeploy

After setting environment variables:
- Go to **Deployments** in Vercel
- Click **"..."** on latest deployment → **Redeploy**

### Step 7: Configure Supabase Storage (For File Uploads)

Your app supports product image uploads. Set up Supabase Storage:

1. In Supabase Dashboard, go to **Storage**
2. Create a new bucket named `uploads`
3. Make it **public** (for images)
4. Update storage policies in SQL Editor:

```sql
-- Allow anyone to read uploads
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- Allow authenticated uploads (via service_role)
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads');
```

### Step 8: Test Everything

1. **Frontend**: Open your Vercel URL
2. **API Health**: Visit `https://[PROJECT-REF].supabase.co/functions/v1/api/health`
3. **Admin Login**: Navigate to `/admin/login` (default: admin@hbtrade.com / admin123)
4. **Submit a Product Request**: Test form submission
5. **Check Database**: Verify data in Supabase > Table Editor

---

## Environment Files Summary

| File | Purpose |
|------|---------|
| `backend/.env.example` | Local development (SQLite) |
| `backend/.env.production.example` | Production (PostgreSQL generic) |
| `backend/.env.supabase.example` | **NEW** - Supabase configuration |
| `render.yaml` | **KEPT** - Render deployment (unchanged) |
| `frontend/.env.production.example` | Frontend production (generic) |
| `frontend/.env.supabase.example` | **NEW** - Vercel + Supabase config |

---

## File Structure After Changes

```
H & B Trade/
├── backend/
│   ├── .env.example                    # Local dev (existing)
│   ├── .env.production.example         # Prod generic (existing)
│   ├── .env.supabase.example           # NEW: Supabase config
│   ├── config/database.js              # Already compatible!
│   ├── server.js
│   ├── Dockerfile                      # KEPT for Render
│   └── ...
├── frontend/
│   ├── .env.production.example         # Existing
│   ├── .env.supabase.example           # NEW: Vercel + Supabase
│   ├── vercel.json                     # Already configured!
│   ├── next.config.js
│   └── ...
├── database/
│   └── schema.sql                      # Use for Supabase init
├── render.yaml                         # KEPT - Render backup
├── SUPABASE_DEPLOYMENT.md              # NEW: This file
└── ... (other files preserved)
```

---

## Cost Comparison

| Service | Free Tier | Paid (approx) |
|---------|-----------|---------------|
| **Supabase DB** | 500MB, 50K monthly active users | $25/month (Pro) |
| **Supabase Edge Functions** | 500K invocations/month | $10/Ginvocation |
| **Vercel (Frontend)** | 100GB bandwidth, serverless | $20/month (Pro) |
| **Total Free** | **$0/month** | - |
| **Total Pro** | - | **~$55/month** |

vs **Render Full Stack**: ~$21/month (Standard plan)

---

## Switching Between Environments

You can maintain BOTH deployments simultaneously:

### To switch from Render to Supabase:
1. Change DNS A-record to point to Vercel
2. Update `FRONTEND_URL` in backend to Vercel domain
3. Redeploy both services

### To switch back to Render:
1. Change DNS back to Render frontend
2. Update environment variables
3. Data stays in both databases independently

### To keep both running:
- Use different domains (e.g., `app.hbtrade.com` → Vercel+Supabase, `staging.hbtrade.com` → Render)
- Or use subpaths with a reverse proxy

---

## Troubleshooting

### "Database connection refused"
- Check `DATABASE_URL` format (use Direct URL, not Pooler for server connections)
- Verify IP allowlist (Supabase may require allowing all IPs for server connections)

### "CORS error" in browser
- Add Vercel domain to `FRONTEND_URL` env var in backend
- Check Supabase CORS settings in Dashboard > Settings > API

### "Environment variable not found"
- Ensure `NEXT_PUBLIC_` vars are set as **build-time** env vars in Vercel
- Trigger redeploy after adding them

### File upload not working
- Set up Supabase Storage bucket (see Step 7)
- Update upload code to use Supabase Storage client instead of local `/uploads`

---

## Quick Reference: Supabase Dashboard URLs

| What | URL Path |
|------|----------|
| Connection String | `Settings > Database > Connection string` |
| API Keys | `Settings > API` |
| JWT Secret | `Settings > API > JWT Secret` |
| SQL Editor | `SQL Editor` (sidebar) |
| Table Editor | `Table Editor` (sidebar) |
| Storage | `Storage` (sidebar) |
| Authentication | `Authentication` (sidebar) |
| Edge Functions | `Edge Functions` (sidebar) |

---

**Done!** You now have dual deployment capability: Render (preserved) + Supabase/Vercel (new).
