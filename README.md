# H&B Trade Platform

A production-ready full-stack web application for H&B Trade - a logistics and sourcing company providing China → Bangladesh product sourcing, wholesale supply, shipping, air cargo, and hand carry services.

## Features

### Public Website
- 🏠 **Home Page** - Hero section, services preview, CTAs
- ℹ️ **About Page** - Company story, mission, expertise
- 📦 **Services Page** - Detailed services with icons
- 📝 **Product Request** - Submit sourcing requests with image upload
- 📍 **Tracking Page** - Real-time shipment tracking
- 📞 **Contact Page** - Contact form, WhatsApp/Facebook integration

### Admin Dashboard
- 🔐 **Authentication** - JWT-based admin login
- 📊 **Dashboard** - Statistics, charts, recent activity
- 📋 **Orders Management** - CRUD operations, tracking assignment
- 🚚 **Tracking Management** - Update shipment progress
- 📨 **Requests Management** - Handle product requests
- 💬 **Messages** - View contact form submissions
- ⚙️ **Settings** - Configure contact information

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- React Hook Form + Zod
- Axios
- Recharts (charts)
- Lucide React (icons)

### Backend
- Express.js
- SQL.js (development) / PostgreSQL (production)
- JWT authentication
- Multer (file uploads)
- Winston (logging)
- Rate limiting, Helmet, CORS

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Development

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory, new terminal)
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Admin Login: http://localhost:3000/admin/login

### Default Admin Credentials
- **Email**: admin@hbtrade.com
- **Password**: admin123

## Project Structure

```
hb-trade-platform/
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/        # App Router pages
│   │   ├── components/ # Reusable UI components
│   │   ├── lib/        # API utilities
│   │   └── types/      # TypeScript types
│   └── package.json
├── backend/            # Express.js API
│   ├── config/         # Database, logger, multer
│   ├── middleware/     # Auth, validation
│   ├── routes/         # API routes
│   └── server.js
├── database/           # SQL schema
└── docker/             # Docker configuration
```

## Production Deployment

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=hbtrade_production
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_64_char_secret
FRONTEND_URL=https://yourdomain.com
```

**Frontend (.env.production):**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Deploy with PM2
```bash
pm2 start ecosystem.config.js --env production
```

## API Endpoints

### Public
- `POST /api/product-request` - Submit product request
- `POST /api/contact` - Send contact message
- `GET /api/track/:tracking_number` - Track shipment
- `GET /api/settings` - Get public settings

### Admin (Protected)
- `POST /api/auth/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard stats
- `GET|POST|PUT|DELETE /api/admin/orders` - Orders CRUD
- `POST|GET /api/admin/tracking` - Tracking management
- `GET|PUT /api/admin/requests` - Product requests
- `GET|PUT|DELETE /api/admin/messages` - Messages management
- `GET|PUT /api/admin/settings` - Settings management

## Security Features

- JWT authentication with token expiration
- Admin role protection
- Input validation with express-validator
- Rate limiting (100 requests per 15 minutes)
- XSS protection
- Helmet security headers
- CORS configuration
- Content Security Policy

## License

MIT License - H&B Trade
