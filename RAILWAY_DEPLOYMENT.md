# Railway Deployment Guide

## Quick Deploy

### Option 1: One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/hbtrade)

### Option 2: Manual Deploy

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

#### Step 2: Login
```bash
railway login
```

#### Step 3: Create Project
```bash
railway init
# Enter project name: hbtrade
```

#### Step 4: Add PostgreSQL
```bash
railway add --plugin postgresql
```

#### Step 5: Deploy Backend
```bash
railway up backend/
```

#### Step 6: Set Backend Environment Variables
```bash
railway variables set \
  NODE_ENV=production \
  PORT=5000 \
  DB_NAME=hbtrade \
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))") \
  JWT_EXPIRE=7d \
  FRONTEND_URL=https://your-frontend-url.railway.app
```

#### Step 7: Deploy Frontend
```bash
railway up frontend/
```

#### Step 8: Set Frontend Environment Variables
```bash
railway variables set \
  NODE_ENV=production \
  NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
```

#### Step 9: Initialize Database
```bash
# Get database connection string
railway connect postgresql

# Run schema
\i database/schema.sql
```

## Environment Variables

### Backend
| Variable | Description | Source |
|----------|-------------|--------|
| NODE_ENV | Environment | `production` |
| PORT | Server port | `5000` |
| DB_HOST | Database host | From PostgreSQL plugin |
| DB_PORT | Database port | From PostgreSQL plugin |
| DB_NAME | Database name | `hbtrade` |
| DB_USER | Database user | From PostgreSQL plugin |
| DB_PASSWORD | Database password | From PostgreSQL plugin |
| JWT_SECRET | JWT secret | Generate 64-char string |
| JWT_EXPIRE | Token expiry | `7d` |
| FRONTEND_URL | Frontend URL | Your frontend URL |

### Frontend
| Variable | Description | Value |
|----------|-------------|-------|
| NODE_ENV | Environment | `production` |
| NEXT_PUBLIC_API_URL | Backend API URL | Your backend URL + `/api` |

## Pricing

### Free Tier (Hobby Plan)
- $5 free credits/month
- 500 hours execution time
- 1GB shared memory
- Shared CPU

### Pro Plan ($20/month)
- Unlimited service hours
- 8GB RAM
- Dedicated CPU
- Custom domains
- Priority support

## Useful Commands

```bash
# View logs
railway logs

# Open service URL
railway open

# Connect to database
railway connect postgresql

# List services
railway status

# Remove service
railway down
```

## Troubleshooting

### Build fails
```bash
# Check build logs
railway logs --service backend

# Common issues:
# - Missing dependencies: Check package.json
# - Build timeout: Upgrade to Pro plan
```

### Database connection fails
```bash
# Verify database is running
railway status

# Check connection string
railway variables
```

### Health check fails
```bash
# Verify health endpoint exists
curl https://your-backend.railway.app/api/health

# Check logs
railway logs --service backend
```
