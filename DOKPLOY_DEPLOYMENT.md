# Dokploy Deployment Guide

Dokploy is an open-source, self-hosted PaaS alternative to Vercel/Netlify.

## Prerequisites

- A VPS (DigitalOcean, Hetzner, Linode, Vultr, etc.)
- Domain name (recommended)
- SSH access to your server
- Minimum: 2GB RAM, 1 vCPU

## Step 1: Install Dokploy

```bash
# SSH into your VPS
ssh root@your-server-ip

# Install Dokploy (automated script)
curl -sSL https://dokploy.com/install.sh | bash

# This will install:
# - Docker
# - Dokploy
# - Traefik (reverse proxy)
# - Automatic SSL with Let's Encrypt
```

After installation, visit: `http://your-server-ip:3000`

## Step 2: Initial Configuration

1. **Create Admin Account**
   - Set username and password
   - Save credentials securely

2. **Configure Domain**
   - Go to Settings → Domains
   - Add your domain: `yourdomain.com`
   - Enable wildcard domain: `*.yourdomain.com`

3. **Configure DNS**
   - Add A record: `@` → your-server-ip
   - Add A record: `api` → your-server-ip
   - Add A record: `www` → your-server-ip

## Step 3: Deploy H&B Trade

### Option A: Deploy from Git (Recommended)

1. **Create New Application**
   - Click "Applications" → "New Application"
   - Name: `hbtrade-backend`
   - Source: Git Repository
   - Repository URL: `https://github.com/YOUR_USERNAME/hbtrade`
   - Branch: `main`
   - Build Path: `/backend`

2. **Configure Backend**
   - Build Type: Dockerfile
   - Dockerfile Path: `Dockerfile`
   - Port: `5000`

3. **Set Environment Variables**
   ```env
   NODE_ENV=production
   PORT=5000
   DB_HOST=postgres
   DB_PORT=5432
   DB_NAME=hbtrade
   DB_USER=postgres
   DB_PASSWORD=your_secure_password
   JWT_SECRET=your_64_char_jwt_secret
   JWT_EXPIRE=7d
   FRONTEND_URL=https://yourdomain.com
   ```

4. **Configure Domain**
   - Domain: `api.yourdomain.com`
   - Enable SSL

5. **Deploy Backend**
   - Click "Deploy"

6. **Create Database**
   - Click "Databases" → "New Database"
   - Type: PostgreSQL
   - Name: `hbtrade-db`
   - Database: `hbtrade`
   - User: `postgres`
   - Password: (same as DB_PASSWORD above)

7. **Deploy Frontend**
   - Create new application
   - Name: `hbtrade-frontend`
   - Build Path: `/frontend`
   - Port: `3000`
   - Environment:
     ```env
     NODE_ENV=production
     NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
     ```
   - Domain: `yourdomain.com`
   - Enable SSL

### Option B: Deploy with Docker Compose

1. **Clone Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/hbtrade.git
   cd hbtrade
   ```

2. **Create Environment File**
   ```bash
   cat > .env << EOF
   DB_USER=postgres
   DB_PASSWORD=$(openssl rand -base64 32)
   JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
   FRONTEND_URL=https://yourdomain.com
   API_URL=https://api.yourdomain.com
   ACME_EMAIL=admin@yourdomain.com
   EOF
   ```

3. **Update Domains in docker-compose.dokploy.yml**
   - Replace `yourdomain.com` with your actual domain

4. **Deploy**
   ```bash
   docker-compose -f docker-compose.dokploy.yml up -d
   ```

## Step 4: Initialize Database

Database is auto-initialized by the mounted schema.sql file.

To verify:

```bash
# Connect to database
docker exec -it hbtrade-postgres psql -U postgres -d hbtrade

# Check tables
\dt

# Verify admin user exists
SELECT email, role FROM users;
```

## Step 5: Configure SSL

Dokploy automatically configures SSL via Let's Encrypt when you:
1. Add a domain to your application
2. Enable SSL in the domain settings
3. Ensure DNS is properly configured

SSL certificates are auto-renewed.

## Environment Variables

### Backend
| Variable | Required | Description |
|----------|----------|-------------|
| NODE_ENV | Yes | `production` |
| PORT | Yes | `5000` |
| DB_HOST | Yes | Database hostname |
| DB_PORT | Yes | `5432` |
| DB_NAME | Yes | `hbtrade` |
| DB_USER | Yes | Database user |
| DB_PASSWORD | **Yes** | Database password |
| JWT_SECRET | **Yes** | 64+ char secret |
| JWT_EXPIRE | No | `7d` |
| FRONTEND_URL | No | Frontend URL for CORS |

### Frontend
| Variable | Required | Description |
|----------|----------|-------------|
| NODE_ENV | Yes | `production` |
| NEXT_PUBLIC_API_URL | Yes | Backend API URL |

## Monitoring & Logs

### Dokploy Dashboard
- Real-time logs
- Resource usage (CPU, Memory)
- Deployment history
- Container status

### View Logs
```bash
# Via Dokploy UI
Applications → hbtrade-backend → Logs

# Via Docker CLI
docker logs hbtrade-backend -f --tail=100
```

### Resource Monitoring
```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## Backup & Restore

### Automated Backups (Dokploy Feature)
1. Go to Settings → Backups
2. Configure backup schedule
3. Set retention policy
4. Choose storage location (S3, SFTP, etc.)

### Manual Backup
```bash
# Backup database
docker exec hbtrade-postgres pg_dump -U postgres hbtrade > backup_$(date +%Y%m%d).sql

# Backup uploads
docker cp hbtrade-backend:/app/uploads ./uploads_backup
```

### Restore
```bash
# Restore database
cat backup_20240115.sql | docker exec -i hbtrade-postgres psql -U postgres hbtrade

# Restore uploads
docker cp ./uploads_backup hbtrade-backend:/app/uploads
```

## Scaling

### Vertical Scaling
- Upgrade VPS plan
- Increase container resources in Dokploy settings

### Horizontal Scaling
```bash
# Scale backend (requires load balancer)
docker-compose -f docker-compose.dokploy.yml up -d --scale backend=3
```

## Troubleshooting

### Application won't start
```bash
# Check logs
docker logs hbtrade-backend

# Common issues:
# - Missing env vars: Check Dokploy environment settings
# - Port conflict: Verify port is not in use
# - Build failure: Check build logs in Dokploy
```

### Database connection fails
```bash
# Verify database is running
docker ps | grep postgres

# Check network connectivity
docker exec hbtrade-backend ping postgres

# Verify credentials
docker exec hbtrade-backend printenv | grep DB_
```

### SSL not working
```bash
# Check Traefik logs
docker logs dokploy-traefik

# Verify DNS
nslookup yourdomain.com

# Check certificate
curl -vI https://yourdomain.com 2>&1 | grep -A5 "SSL certificate"
```

### Traefik issues
```bash
# Restart Traefik
docker restart dokploy-traefik

# Check Traefik configuration
docker exec dokploy-traefik traefik version

# View Traefik dashboard
# Visit: http://your-server-ip:8080
```

## Useful Commands

```bash
# List all containers
docker ps

# Restart application
docker restart hbtrade-backend

# View resource usage
docker stats

# Execute command in container
docker exec -it hbtrade-backend sh

# Check container health
docker inspect hbtrade-backend | grep -A10 Health

# Clean up unused resources
docker system prune -a
```

## Cost Estimation

### VPS Pricing (Example: DigitalOcean)
- **Basic:** $6/month (1 vCPU, 1GB RAM) - Development
- **Standard:** $12/month (1 vCPU, 2GB RAM) - Small production
- **Performance:** $24/month (2 vCPU, 4GB RAM) - Production

### Total Cost
- VPS: $6-24/month
- Domain: ~$10/year
- **Total: $6-24/month** (no platform fees!)

## Advantages of Dokploy

✅ **Self-hosted** - Full control over infrastructure
✅ **Free forever** - No platform fees
✅ **Open source** - Community driven
✅ **Auto SSL** - Let's Encrypt integration
✅ **Git integration** - Auto-deploy on push
✅ **Database management** - Built-in PostgreSQL, MySQL, MongoDB, Redis
✅ **Monitoring** - Real-time logs and metrics
✅ **Backups** - Automated backup scheduling
✅ **Multi-app** - Deploy multiple applications
✅ **Docker Compose** - Full support for compose files

## Comparison: Dokploy vs Coolify

| Feature | Dokploy | Coolify |
|---------|---------|---------|
| UI/UX | Modern, clean | Modern, feature-rich |
| Database Support | PostgreSQL, MySQL, MongoDB, Redis | PostgreSQL, MySQL, MongoDB, Redis |
| Git Integration | ✅ | ✅ |
| Auto SSL | ✅ Let's Encrypt | ✅ Let's Encrypt |
| Docker Compose | ✅ | ✅ |
| Monitoring | Basic | Advanced |
| Backups | ✅ | ✅ |
| Community | Growing | Larger |
| Documentation | Good | Excellent |

## Next Steps

1. Set up automated backups
2. Configure monitoring alerts
3. Set up staging environment
4. Implement CI/CD with webhooks
5. Configure custom domains for all services
