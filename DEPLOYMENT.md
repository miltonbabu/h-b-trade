# H&B Trade - VPS Deployment Guide

This guide will help you deploy the H&B Trade platform to a VPS server.

## Prerequisites

- A VPS server (Ubuntu 20.04/22.04 recommended)
- At least 2GB RAM, 2 CPU cores
- Domain name (optional but recommended)
- SSH access to your server

---

## Quick Deployment (Automated)

### Step 1: Upload Code to VPS

From your local machine, upload the code (excluding node_modules):

```bash
# Using rsync (recommended)
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ user@your-vps-ip:/var/www/hbtrade/

# Or using SCP
scp -r backend frontend package.json ecosystem.config.js deploy.sh \
  user@your-vps-ip:/var/www/hbtrade/
```

### Step 2: Run Deployment Script

SSH into your VPS and run:

```bash
ssh user@your-vps-ip
sudo chmod +x /var/www/hbtrade/deploy.sh
sudo /var/www/hbtrade/deploy.sh
```

---

## Manual Deployment (Step by Step)

### 1. Connect to Your VPS

```bash
ssh root@your-vps-ip
```

### 2. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs
node --version  # Should show v20.x.x
```

### 3. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 4. Install Nginx (Reverse Proxy)

```bash
sudo apt update
sudo apt install -y nginx
```

### 5. Create Application Directory

```bash
sudo mkdir -p /var/www/hbtrade
sudo chown -R $USER:$USER /var/www/hbtrade
```

### 6. Upload Your Code

From your local machine:

```bash
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ user@your-vps-ip:/var/www/hbtrade/
```

### 7. Install Dependencies

```bash
cd /var/www/hbtrade

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install --production

# Install frontend dependencies
cd ../frontend
npm install
```

### 8. Configure Environment Variables

**Backend (.env):**
```bash
cd /var/www/hbtrade/backend
cp .env.production.example .env
nano .env
```

Update these values:
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_64_char_random_string_here
FRONTEND_URL=https://yourdomain.com
```

**Frontend (.env.production):**
```bash
cd /var/www/hbtrade/frontend
cp .env.production.example .env.production
nano .env.production
```

Update:
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

### 9. Build Frontend

```bash
cd /var/www/hbtrade/frontend
npm run build
```

### 10. Start with PM2

```bash
cd /var/www/hbtrade
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # Follow the command it outputs
```

### 11. Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/hbtrade
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend - Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads {
        alias /var/www/hbtrade/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/hbtrade /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 12. Setup SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Useful Commands

### PM2 Commands
```bash
pm2 status              # Check app status
pm2 logs                # View all logs
pm2 logs hbtrade-backend  # View backend logs
pm2 restart all         # Restart all apps
pm2 restart hbtrade-backend  # Restart backend only
pm2 stop all            # Stop all apps
pm2 monit               # Monitor resources
```

### Nginx Commands
```bash
sudo systemctl status nginx   # Check status
sudo systemctl restart nginx  # Restart
sudo nginx -t                 # Test config
tail -f /var/log/nginx/error.log  # View errors
```

### Update Deployment
```bash
cd /var/www/hbtrade
git pull  # If using git
cd frontend && npm run build
pm2 restart all
```

---

## Firewall Setup (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## Troubleshooting

### App not starting
```bash
pm2 logs --err
```

### Nginx 502 Bad Gateway
- Check if PM2 apps are running: `pm2 status`
- Check if ports are correct in ecosystem.config.js

### Database connection issues
- Verify .env credentials
- Check if PostgreSQL is running (if using): `sudo systemctl status postgresql`

---

## Architecture Overview

```
Internet
    │
    ▼
┌─────────────┐
│   Nginx     │ (Port 80/443)
│ (Reverse    │
│   Proxy)    │
└─────┬───────┘
      │
      ├─────────────────────┐
      │                     │
      ▼                     ▼
┌─────────────┐     ┌─────────────┐
│  Frontend   │     │   Backend   │
│  (Next.js)  │     │  (Express)  │
│  Port 3000  │     │  Port 5000  │
└─────────────┘     └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Database   │
                    │  (SQLite/   │
                    │  PostgreSQL)│
                    └─────────────┘
```
