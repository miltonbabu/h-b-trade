#!/bin/bash

# H&B Trade Deployment Script for VPS
# Run this script on your VPS server

set -e

echo "=========================================="
echo "  H&B Trade VPS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/hbtrade"
NODE_VERSION="20"

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root or with sudo"
    exit 1
fi

# Step 1: Install Node.js
echo ""
echo "Step 1: Installing Node.js $NODE_VERSION..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash -
    apt-get install -y nodejs
    print_status "Node.js installed: $(node --version)"
else
    print_warning "Node.js already installed: $(node --version)"
fi

# Step 2: Install PM2 globally
echo ""
echo "Step 2: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    print_status "PM2 installed"
else
    print_warning "PM2 already installed"
fi

# Step 3: Install Nginx
echo ""
echo "Step 3: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get update
    apt-get install -y nginx
    print_status "Nginx installed"
else
    print_warning "Nginx already installed"
fi

# Step 4: Create application directory
echo ""
echo "Step 4: Setting up application directory..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/backend/uploads
print_status "Directory structure created"

# Step 5: Clone or upload code
echo ""
echo "Step 5: Application code setup..."
echo ""
print_warning "Please upload your code to $APP_DIR"
echo "Options:"
echo "  1. Git clone: cd /var/www && git clone <your-repo-url> hbtrade"
echo "  2. SCP upload: scp -r ./backend ./frontend package.json user@your-vps:/var/www/hbtrade/"
echo "  3. rsync: rsync -avz --exclude 'node_modules' --exclude '.next' ./ user@your-vps:/var/www/hbtrade/"
echo ""
read -p "Press Enter after uploading your code..."

# Step 6: Install dependencies
echo ""
echo "Step 6: Installing dependencies..."
cd $APP_DIR

if [ -f "package.json" ]; then
    npm install
    print_status "Root dependencies installed"
fi

cd $APP_DIR/backend
if [ -f "package.json" ]; then
    npm install --production
    print_status "Backend dependencies installed"
fi

cd $APP_DIR/frontend
if [ -f "package.json" ]; then
    npm install
    print_status "Frontend dependencies installed"
fi

# Step 7: Build frontend
echo ""
echo "Step 7: Building frontend..."
cd $APP_DIR/frontend
npm run build
print_status "Frontend built successfully"

# Step 8: Setup environment files
echo ""
echo "Step 8: Environment configuration..."
print_warning "Please configure your environment files:"
echo "  - $APP_DIR/backend/.env (copy from .env.production.example)"
echo "  - $APP_DIR/frontend/.env.production (copy from .env.production.example)"
echo ""
read -p "Press Enter after configuring environment files..."

# Step 9: Start with PM2
echo ""
echo "Step 9: Starting application with PM2..."
cd $APP_DIR
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
print_status "Application started with PM2"

# Step 10: Configure Nginx
echo ""
echo "Step 10: Configuring Nginx..."
cat > /etc/nginx/sites-available/hbtrade << 'NGINX_CONF'
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
NGINX_CONF

ln -sf /etc/nginx/sites-available/hbtrade /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
print_status "Nginx configured"

# Step 11: Setup SSL with Let's Encrypt
echo ""
echo "Step 11: SSL Certificate setup..."
echo ""
print_warning "To setup SSL, run:"
echo "  apt-get install certbot python3-certbot-nginx"
echo "  certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo ""

# Final summary
echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Your application should now be running at:"
echo "  - Frontend: http://yourdomain.com"
echo "  - Backend API: http://yourdomain.com/api"
echo ""
echo "Useful commands:"
echo "  - Check status: pm2 status"
echo "  - View logs: pm2 logs"
echo "  - Restart app: pm2 restart all"
echo "  - Nginx logs: tail -f /var/log/nginx/error.log"
echo ""
