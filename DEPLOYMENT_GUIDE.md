# Multi-Platform Deployment Guide

Complete deployment guide for H&B Trade Platform on multiple hosting platforms.

## Table of Contents

1. [Platform Comparison](#platform-comparison)
2. [Quick Decision Guide](#quick-decision-guide)
3. [Platform-Specific Guides](#platform-specific-guides)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Platform Comparison

| Feature | Render | Railway | Coolify | Dokploy |
|---------|--------|---------|---------|---------|
| **Type** | Managed PaaS | Managed PaaS | Self-hosted PaaS | Self-hosted PaaS |
| **Free Tier** | ✅ Yes | ✅ $5/month credit | ❌ Need VPS | ❌ Need VPS |
| **Setup Difficulty** | Easy | Easy | Medium | Medium |
| **Database** | PostgreSQL | PostgreSQL | PostgreSQL | PostgreSQL |
| **Auto SSL** | ✅ | ✅ | ✅ | ✅ |
| **Custom Domains** | ✅ | ✅ | ✅ | ✅ |
| **Auto Deploy** | ✅ | ✅ | ✅ | ✅ |
| **Monitoring** | Basic | Basic | Advanced | Basic |
| **Backups** | Manual | Manual | Automated | Automated |
| **Cost (Production)** | $21/month | $20/month | $6-24/month* | $6-24/month* |
| **Vendor Lock-in** | Medium | Medium | None | None |
| **Control** | Low | Low | Full | Full |
| **Scalability** | Easy | Easy | Manual | Manual |

*VPS cost only (no platform fees)

---

## Quick Decision Guide

### Choose **Render** if:
- ✅ You want the easiest setup
- ✅ You want free tier to start
- ✅ You don't want to manage servers
- ✅ You want automatic scaling
- ✅ You're okay with cold starts on free tier

### Choose **Railway** if:
- ✅ You want simple deployment
- ✅ You like credit-based pricing
- ✅ You want good developer experience
- ✅ You need flexible resource allocation
- ✅ You want to avoid cold starts

### Choose **Coolify** if:
- ✅ You want full control
- ✅ You have a VPS already
- ✅ You want no platform fees
- ✅ You need advanced monitoring
- ✅ You want automated backups
- ✅ You're comfortable with Docker

### Choose **Dokploy** if:
- ✅ You want full control
- ✅ You have a VPS already
- ✅ You want no platform fees
- ✅ You like modern UI
- ✅ You want simple database management
- ✅ You're comfortable with Docker

---

## Platform-Specific Guides

### 1. Render Deployment

**Files:** `render.yaml`, `RENDER_DEPLOYMENT.md`

**Quick Start:**
```bash
# 1. Push to GitHub
git push origin main

# 2. Go to Render Dashboard
# 3. New → Blueprint → Connect Repo
# 4. Click "Apply"
```

**Cost:**
- Free: $0/month (with limitations)
- Production: $21/month

**Docs:** [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

---

### 2. Railway Deployment

**Files:** `railway.toml`, `RAILWAY_DEPLOYMENT.md`

**Quick Start:**
```bash
# 1. Install CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up backend/
railway up frontend/

# 4. Add PostgreSQL
railway add --plugin postgresql
```

**Cost:**
- Hobby: $5/month (free credits)
- Pro: $20/month

**Docs:** [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

---

### 3. Coolify Deployment

**Files:** `docker-compose.coolify.yml`, `nginx/nginx.conf`, `COOLIFY_DEPLOYMENT.md`

**Quick Start:**
```bash
# 1. Install Coolify on VPS
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# 2. Configure in dashboard
# 3. Deploy from Git or Docker Compose
```

**Cost:**
- VPS only: $6-24/month
- No platform fees

**Docs:** [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md)

---

### 4. Dokploy Deployment

**Files:** `docker-compose.dokploy.yml`, `DOKPLOY_DEPLOYMENT.md`

**Quick Start:**
```bash
# 1. Install Dokploy on VPS
curl -sSL https://dokploy.com/install.sh | bash

# 2. Configure in dashboard
# 3. Deploy from Git or Docker Compose
```

**Cost:**
- VPS only: $6-24/month
- No platform fees

**Docs:** [DOKPLOY_DEPLOYMENT.md](./DOKPLOY_DEPLOYMENT.md)

---

## Environment Variables

### Required Variables (All Platforms)

#### Backend
```env
# Server
NODE_ENV=production
PORT=5000

# Database
DB_HOST=<database-host>
DB_PORT=5432
DB_NAME=hbtrade
DB_USER=postgres
DB_PASSWORD=<secure-password>

# Authentication
JWT_SECRET=<64-char-secret>
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=https://yourdomain.com
```

#### Frontend
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Generate Secrets

```bash
# JWT Secret (64 characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Database Password
openssl rand -base64 32
```

---

## Post-Deployment Checklist

### 1. Verify Services
- [ ] Frontend loads: `https://yourdomain.com`
- [ ] Backend API responds: `https://api.yourdomain.com/api`
- [ ] Database connected (check logs)
- [ ] SSL certificates valid

### 2. Initialize Database
- [ ] Run `database/schema.sql`
- [ ] Verify tables created
- [ ] Check default admin user

### 3. Test Functionality
- [ ] Admin login works
- [ ] Public pages load
- [ ] Product request submission
- [ ] Tracking lookup
- [ ] File uploads work

### 4. Security
- [ ] Change default admin password
- [ ] Verify HTTPS everywhere
- [ ] Check CORS settings
- [ ] Test rate limiting

### 5. Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Enable backup scheduling

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Fails
```bash
# Check database is running
docker ps | grep postgres

# Verify credentials
echo $DB_PASSWORD

# Test connection
psql "postgresql://postgres:PASSWORD@HOST:5432/hbtrade"
```

**Solution:**
- Verify DB_HOST, DB_USER, DB_PASSWORD
- Check database service is running
- Ensure network connectivity

#### 2. Frontend Can't Connect to Backend
```bash
# Check backend is running
curl https://api.yourdomain.com/api/health

# Verify CORS
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://api.yourdomain.com/api/health
```

**Solution:**
- Update FRONTEND_URL in backend
- Update NEXT_PUBLIC_API_URL in frontend
- Check CORS configuration

#### 3. SSL Certificate Issues
```bash
# Check certificate
curl -vI https://yourdomain.com 2>&1 | grep -A5 "SSL"

# Verify DNS
nslookup yourdomain.com
```

**Solution:**
- Ensure DNS is properly configured
- Wait for DNS propagation (up to 48 hours)
- Re-issue certificate in platform dashboard

#### 4. Build Fails
```bash
# Check build logs
# Common issues:
# - Missing dependencies
# - Environment variable not set
# - Out of memory
```

**Solution:**
- Check all dependencies in package.json
- Verify environment variables are set
- Increase memory limit

#### 5. Cold Start Issues (Render/Railway Free Tier)
```bash
# Free tier services spin down after 15 min inactivity
# First request takes 30-60 seconds
```

**Solution:**
- Upgrade to paid plan
- Use cron job to keep service warm
- Implement loading states in frontend

---

## Cost Optimization

### Free Tier Strategy
1. Start with Render free tier
2. Test all functionality
3. Upgrade when ready for production

### Production Strategy
1. **Low Traffic:** Coolify/Dokploy on $6/month VPS
2. **Medium Traffic:** Render/Railway $20-21/month
3. **High Traffic:** Coolify/Dokploy on $24+/month VPS + CDN

### Cost Comparison (Monthly)

| Platform | Development | Production | High Traffic |
|----------|-------------|------------|--------------|
| Render | $0 | $21 | $42+ |
| Railway | $0-5 | $20 | $40+ |
| Coolify | $6 | $12 | $24+ |
| Dokploy | $6 | $12 | $24+ |

---

## Migration Between Platforms

### From Render to Railway
1. Export database from Render
2. Deploy to Railway
3. Import database
4. Update DNS

### From Managed to Self-Hosted
1. Set up VPS with Coolify/Dokploy
2. Deploy application
3. Export database from old platform
4. Import to new database
5. Update DNS

### Database Migration
```bash
# Export
pg_dump -h old-host -U postgres hbtrade > backup.sql

# Import
psql -h new-host -U postgres hbtrade < backup.sql
```

---

## Support & Resources

### Platform Documentation
- **Render:** https://render.com/docs
- **Railway:** https://docs.railway.app
- **Coolify:** https://coolify.io/docs
- **Dokploy:** https://dokploy.com/docs

### Community
- **Render:** Discord, GitHub Discussions
- **Railway:** Discord, GitHub
- **Coolify:** Discord, GitHub
- **Dokploy:** Discord, GitHub

### Status Pages
- **Render:** https://status.render.com
- **Railway:** https://status.railway.app
- **Coolify:** Self-monitored
- **Dokploy:** Self-monitored

---

## Quick Reference

### Deployment Commands

```bash
# Render
# Just push to GitHub - auto deploys

# Railway
railway up

# Coolify
docker-compose -f docker-compose.coolify.yml up -d

# Dokploy
docker-compose -f docker-compose.dokploy.yml up -d
```

### Useful Commands

```bash
# View logs
docker logs <container-name> -f

# Restart service
docker restart <container-name>

# Check status
docker ps

# Execute in container
docker exec -it <container-name> sh

# Database connection
docker exec -it <db-container> psql -U postgres -d hbtrade
```

---

**Choose your platform and follow the specific guide!** 🚀
