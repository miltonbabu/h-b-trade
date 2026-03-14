# Coolify Deployment Guide

Coolify is an open-source, self-hosted PaaS. Deploy on any VPS.

## Prerequisites

- A VPS (DigitalOcean, Hetzner, Linode, Vultr, etc.)
- Domain name (optional but recommended)
- SSH access to your server

## Step 1: Install Coolify on Your VPS

```bash
# SSH into your VPS
ssh root@your-server-ip

# Install Coolify (automated script)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# This will:
# - Install Docker
# - Install Coolify
# - Set up SSL with Let's Encrypt
# - Configure firewall
```

After installation, visit: `http://your-server-ip:3000`

## Step 2: Configure Coolify

1. **Create Admin Account**
   - Set username and password
   - Save these credentials

2. **Add Your Server**
   - Coolify auto-detects local server
   - Click "Add Server" → "Localhost"

3. **Configure Domain** (Optional)
   - Go to Settings → Configuration
   - Add your domain: `yourdomain.com`
   - Enable SSL with Let's Encrypt

## Step 3: Deploy H&B Trade

### Option A: Deploy from Git Repository

1. **Create New Resource**
   - Click "New Resource" → "Service"
   - Select "Docker Compose from Git"

2. **Configure Repository**
   - Repository URL: `https://github.com/YOUR_USERNAME/hbtrade`
   - Branch: `main`
   - Compose File: `docker-compose.coolify.yml`

3. **Set Environment Variables**
   ```env
   DB_PASSWORD=your_secure_password
   JWT_SECRET=your_64_char_jwt_secret
   FRONTEND_URL=https://yourdomain.com
   API_URL=https://api.yourdomain.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for all services to start

### Option B: Deploy Manually

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
   EOF
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.coolify.yml up -d
   ```

4. **Check Status**
   ```bash
   docker-compose -f docker-compose.coolify.yml ps
   ```

## Step 4: Configure Domain & SSL

### Using Coolify Dashboard

1. **Add Domain to Frontend**
   - Go to Services → hbtrade-frontend
   - Click "Domains"
   - Add: `yourdomain.com`
   - Enable SSL

2. **Add Domain to Backend**
   - Go to Services → hbtrade-backend
   - Click "Domains"
   - Add: `api.yourdomain.com`
   - Enable SSL

### Manual Nginx Configuration

If using the included nginx config:

1. **Update nginx.conf**
   - Replace `yourdomain.com` with your actual domain
   - Update SSL certificate paths

2. **Generate SSL Certificates**
   ```bash
   # Using Certbot
   certbot certonly --nginx -d yourdomain.com -d api.yourdomain.com

   # Copy certificates
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
   ```

3. **Restart Nginx**
   ```bash
   docker-compose -f docker-compose.coolify.yml restart nginx
   ```

## Step 5: Initialize Database

The database is automatically initialized by the schema.sql file mounted in docker-compose.

To verify:

```bash
# Connect to database
docker exec -it hbtrade-postgres psql -U postgres -d hbtrade

# Check tables
\dt

# Should see:
# - users
# - orders
# - products
# - product_requests
# - tracking
# - messages
# - settings
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| DB_USER | No | Database user (default: postgres) |
| DB_PASSWORD | **Yes** | Database password |
| JWT_SECRET | **Yes** | JWT signing secret (64+ chars) |
| FRONTEND_URL | No | Frontend URL for CORS |
| API_URL | No | Backend API URL |

## Useful Commands

```bash
# View logs
docker-compose -f docker-compose.coolify.yml logs -f

# View specific service logs
docker-compose -f docker-compose.coolify.yml logs -f backend

# Restart services
docker-compose -f docker-compose.coolify.yml restart

# Stop all services
docker-compose -f docker-compose.coolify.yml down

# Update deployment
git pull
docker-compose -f docker-compose.coolify.yml up -d --build

# Check resource usage
docker stats
```

## Monitoring

### Coolify Dashboard
- CPU & Memory usage
- Network traffic
- Container status
- Deployment history

### Logs
```bash
# All logs
docker-compose -f docker-compose.coolify.yml logs

# Real-time logs
docker-compose -f docker-compose.coolify.yml logs -f --tail=100
```

## Backup & Restore

### Backup Database
```bash
# Create backup
docker exec hbtrade-postgres pg_dump -U postgres hbtrade > backup_$(date +%Y%m%d).sql

# Backup uploads
tar -czf uploads_$(date +%Y%m%d).tar.gz backend/uploads/
```

### Restore Database
```bash
# Restore from backup
cat backup_20240115.sql | docker exec -i hbtrade-postgres psql -U postgres hbtrade
```

## Scaling

### Horizontal Scaling
```bash
# Scale backend (if using load balancer)
docker-compose -f docker-compose.coolify.yml up -d --scale backend=3
```

### Vertical Scaling
- Upgrade VPS plan
- Increase Docker memory limits in compose file

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs hbtrade-backend

# Common issues:
# - Missing env vars: Check .env file
# - Port in use: Change port mapping
# - Volume issues: Check volume permissions
```

### Database connection fails
```bash
# Check if database is running
docker ps | grep postgres

# Check connection
docker exec hbtrade-backend ping postgres

# Verify credentials
docker exec hbtrade-backend printenv | grep DB_
```

### SSL not working
```bash
# Check certificate files
ls -la nginx/ssl/

# Verify nginx config
docker exec hbtrade-nginx nginx -t

# Check nginx logs
docker logs hbtrade-nginx
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

## Advantages of Coolify

✅ **Self-hosted** - Full control over your infrastructure
✅ **No vendor lock-in** - Easy to migrate
✅ **Cost-effective** - No platform fees
✅ **Open source** - Community driven
✅ **SSL included** - Free Let's Encrypt certificates
✅ **Auto-deploy** - Git integration with webhooks
✅ **Monitoring** - Built-in dashboards
✅ **Backups** - Automated backup scheduling

## Next Steps

1. Set up automated backups in Coolify dashboard
2. Configure monitoring alerts
3. Set up staging environment
4. Implement CI/CD with webhooks
