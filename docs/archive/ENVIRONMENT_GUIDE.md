# Environment switching guide for LEARNX

## Quick Start

### 🏠 Local Development (Local Backend)
```bash
# Terminal 1: Start backend
cd c:\Users\ranad\OneDrive\Desktop\LEARNX
mvn spring-boot:run
# Backend runs on http://localhost:8080

# Terminal 2: Start frontend (connects to local backend)
cd c:\Users\ranad\OneDrive\Desktop\LEARNX\web
npm run dev
# Frontend runs on http://localhost:3000
# Uses .env.local with NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### ☁️ Production Backend (Cloud Deployment)
```bash
# No backend to run locally - it's on Railway
# Just start frontend (connects to production backend)
cd c:\Users\ranad\OneDrive\Desktop\LEARNX\web
npm run dev
# Frontend runs on http://localhost:3000
# Uses .env.local with Supabase connection
```

## Testing

### Test Production API
```bash
# Check if production API is online
curl https://learnx-production-3bf1.up.railway.app/api/v1/health

# Should return: HTTP 200 with health status
```

### Test Local API
```bash
# Check if local API is running
curl http://localhost:8080/api/v1/health
```

## Environment Files

### .env.local (Local Development - DO NOT commit)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://mbvgxpcmvcgyvjlauipm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_IrvljfJvZ-Ld9aBOvUqiyA_FLSW299T
```

### .env.production (Vercel Production - DO NOT commit)
```
NEXT_PUBLIC_API_URL=https://learnx-production-3bf1.up.railway.app/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://mbvgxpcmvcgyvjlauipm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_IrvljfJvZ-Ld9aBOvUqiyA_FLSW299T
```

Both are automatically loaded by Next.js based on context.

## NPM Scripts

Available in `web/package.json`:

```bash
npm run dev          # Start dev server (uses .env.local)
npm run build        # Build for production (uses .env.production)
npm run start        # Start production server
npm test             # Run tests
npm run lint         # Run ESLint
```

## Docker Setup (Optional)

Run PostgreSQL locally for backend development:

```bash
cd c:\Users\ranad\OneDrive\Desktop\LEARNX

# Start database
docker-compose up -d

# Check if running
docker-compose ps

# View logs
docker-compose logs -f postgres

# Stop database
docker-compose down
```

Default credentials in docker-compose.yml:
- Host: localhost:5432
- Database: learnx
- User: postgres
- Password: postgres

## Production Deployment Flow

### 1. Deploy Frontend to Vercel
```bash
cd c:\Users\ranad\OneDrive\Desktop\LEARNX\web

# First time setup
vercel login
vercel

# Configure in Vercel Dashboard → Add env vars from .env.production
# Subsequent deploys
git push origin main  # Auto-deploy on push
# OR manual deployment
vercel --prod
```

### 2. Backend (Already on Railway)
- Automatically deployed when pushing to GitHub
- View status: https://railway.app
- Check logs: https://railway.app/project/YOUR_PROJECT_ID

### 3. Database (Supabase)
- Already provisioned
- Connection: See Supabase dashboard
- Access: https://supabase.com/dashboard

## Common Commands

```bash
# Start local development
cd c:\Users\ranad\OneDrive\Desktop\LEARNX
mvn spring-boot:run &  # Backend in background
cd web && npm run dev   # Frontend

# Build frontend for production
cd c:\Users\ranad\OneDrive\Desktop\LEARNX\web
npm run build

# Check production API health
curl https://learnx-production-3bf1.up.railway.app/api/v1/health

# View Railway logs
railway logs

# Clear npm cache if having issues
npm cache clean --force
cd web && rm -r node_modules && npm install
```

## URLs Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Local Frontend | http://localhost:3000 | Development UI |
| Local Backend | http://localhost:8080 | Development API |
| Production API | https://learnx-production-3bf1.up.railway.app/api/v1 | Cloud backend |
| Production DB | supabase.com | Cloud database |
| Vercel | vercel.com | Frontend hosting |
| Railway | railway.app | Backend hosting |

---

**You're all set!** Start with local development, then deploy to Vercel and Railway for production.
