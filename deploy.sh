#!/bin/bash

echo "🚀 Starting H&B Trade Deployment..."

echo "📦 Installing backend dependencies..."
cd backend
npm install --production

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🔨 Building frontend..."
npm run build

echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Set up your PostgreSQL database"
echo "2. Copy .env.production.example to .env and fill in values"
echo "3. Run: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\" > JWT_SECRET"
echo "4. Start with PM2: pm2 start ecosystem.config.js"
