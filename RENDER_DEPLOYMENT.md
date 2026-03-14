# Render Deployment Guide

This guide explains how to deploy the H&B Trade Platform to Render.

## Prerequisites

1. A [Render](https://render.com) account (free tier available)
2. Your code pushed to a GitHub repository
3. PostgreSQL database schema ready

## Deployment Options

### Option 1: Using render.yaml (Recommended)

The `render.yaml` file in the root directory defines all services. This is the easiest way to deploy.

#### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` automatically

3. **Review and Deploy**
   - Review the services that will be created
   - Click "Apply" to start deployment
   - Render will create:
     - PostgreSQL database
     - Backend API service
     - Frontend web service

4. **Initialize Database**
   - After deployment, connect to your PostgreSQL database
   - Run the schema from `database/schema.sql`
   - Create admin user using `backend/scripts/createAdmin.js`

### Option 2: Manual Deployment

If you prefer to deploy services manually:

#### Step 1: Create PostgreSQL Database

1. In Render Dashboard, click "New" → "PostgreSQL"
2. Configure:
   - Name: `hbtrade-db`
   - Database: `hbtrade`
   - User: `postgres`
   - Region: Choose closest to your users
   - Plan: Starter (free) or Standard ($7/month)
3. Save the connection details

#### Step 2: Deploy Backend

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `hbtrade-backend`
   - Root Directory: `backend`
   - Runtime: Docker
   - Dockerfile Path: `./Dockerfile`
   - Plan: Starter (free) or Standard ($7/month)

4. Set Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=<from-database>
   DB_PORT=5432
   DB_NAME=hbtrade
   DB_USER=postgres
   DB_PASSWORD=<from-database>
   JWT_SECRET=<generate-64-char-secret>
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

#### Step 3: Deploy Frontend

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `hbtrade-frontend`
   - Root Directory: `frontend`
   - Runtime: Docker
   - Dockerfile Path: `./Dockerfile`
   - Plan: Starter (free) or Standard ($7/month)

4. Set Environment Variables:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   ```

## Post-Deployment Steps

### 1. Initialize Database Schema

Connect to your PostgreSQL database and run:

```bash
# Using Render CLI
render psql hbtrade-db < database/schema.sql

# Or using psql directly
psql <connection-string> < database/schema.sql
```

### 2. Create Admin User

```bash
# Generate hashed password
node backend/scripts/createAdmin.js

# Run the generated SQL in your database
```

### 3. Update CORS Settings

Ensure `FRONTEND_URL` in backend matches your frontend URL.

### 4. Test Deployment

- Frontend: `https://your-frontend.onrender.com`
- Backend API: `https://your-backend.onrender.com/api`
- Admin Login: `https://your-frontend.onrender.com/admin/login`

## Environment Variables Reference

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment mode | `production` |
| PORT | Server port | `5000` |
| DB_HOST | Database host | From Render |
| DB_PORT | Database port | `5432` |
| DB_NAME | Database name | `hbtrade` |
| DB_USER | Database user | `postgres` |
| DB_PASSWORD | Database password | From Render |
| JWT_SECRET | JWT signing secret | 64-char string |
| JWT_EXPIRE | Token expiration | `7d` |
| FRONTEND_URL | Frontend URL for CORS | `https://...` |

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment mode | `production` |
| NEXT_PUBLIC_API_URL | Backend API URL | `https://.../api` |

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify database connection string
- Check logs in Render dashboard

### Frontend build fails
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility
- Review build logs

### Database connection fails
- Verify database is running
- Check connection string format
- Ensure firewall allows connections

### CORS errors
- Update `FRONTEND_URL` in backend
- Verify API URL in frontend

## Cost Estimation

### Free Tier (Starter)
- PostgreSQL: Free (limited storage)
- Backend: Free (spins down after inactivity)
- Frontend: Free (spins down after inactivity)
- **Total: $0/month**

### Production (Standard)
- PostgreSQL: $7/month
- Backend: $7/month
- Frontend: $7/month
- **Total: $21/month**

## Monitoring

Render provides:
- Real-time logs
- Metrics (CPU, memory, requests)
- Alerts for downtime
- Automatic SSL certificates

## Next Steps

1. Set up custom domain (add CNAME records)
2. Configure error tracking (Sentry)
3. Set up automated backups for database
4. Implement CI/CD with Render
