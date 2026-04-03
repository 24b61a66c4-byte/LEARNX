# LEARNX Deployment & Environment Configuration

## 🚀 Production Setup

Your LEARNX application is deployed on **Railway** with the following endpoints:

### Production API
```
https://learnx-production-3bf1.up.railway.app/api/v1
```

**Status**: ✅ Online and responding

### Production Database
```
Supabase PostgreSQL: mbvgxpcmvcgyvjlauipm.supabase.co
```

## Environment Configuration

### Local Development (`.env.local`)

For running the frontend locally with local backend:
```bash
# Frontend: http://localhost:3000
# Backend: http://localhost:8080

NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://mbvgxpcmvcgyvjlauipm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_IrvljfJvZ-Ld9aBOvUqiyA_FLSW299T
```

### Production (`.env.production`)

For building and deploying with production backend:
```bash
# Frontend: Deployed on Vercel
# Backend: Railway API

NEXT_PUBLIC_API_URL=https://learnx-production-3bf1.up.railway.app/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://mbvgxpcmvcgyvjlauipm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_IrvljfJvZ-Ld9aBOvUqiyA_FLSW299T
```

## Running Locally

### Option 1: Full Local Stack (Backend + Frontend + Local DB)

**Terminal 1 - Backend:**
```bash
cd c:\Users\ranad\OneDrive\Desktop\LEARNX
mvn spring-boot:run
# Runs on http://localhost:8080
```

**Terminal 2 - Frontend:**
```bash
cd c:\Users\ranad\OneDrive\Desktop\LEARNX\web
npm run dev
# Runs on http://localhost:3000
```

**Terminal 3 - Database (Optional, if using Docker):**
```bash
cd c:\Users\ranad\OneDrive\Desktop\LEARNX
docker-compose up -d
# PostgreSQL runs on localhost:5432
```

### Option 2: Local Frontend + Production Backend

No need to run the backend locally. Just use the production API:

**Terminal 1 - Frontend Only:**
```bash
cd c:\Users\ranad\OneDrive\Desktop\LEARNX\web
npm run dev
# Connects to production API at Railway
```

The frontend will automatically use `https://learnx-production-3bf1.up.railway.app/api/v1`

## Deployment

### Frontend Deployment (Vercel)

1. **Connect GitHub:**
   ```bash
   cd c:\Users\ranad\OneDrive\Desktop\LEARNX\web
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Configure Environment Variables in Vercel:**
   - Go to Vercel Dashboard > Settings > Environment Variables
   - Add the `.env.production` values:
     - `NEXT_PUBLIC_API_URL=https://learnx-production-3bf1.up.railway.app/api/v1`
     - `NEXT_PUBLIC_SUPABASE_URL=https://mbvgxpcmvcgyvjlauipm.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_IrvljfJvZ-Ld9aBOvUqiyA_FLSW299T`

3. **Deploy:**
   - Push to main branch, Vercel auto-deploys
   - Or manually: `vercel --prod`

### Backend Deployment (Railway)

Already configured and running! You can:

1. **Update Backend:**
   - Push changes to GitHub main branch
   - Railway auto-deploys on push

2. **Configure Railway:**
   - Go to https://railway.app
   - Select LEARNX project
   - View logs: Dashboard > Logs
   - Set environment variables: Settings > Variables

3. **View Production Logs:**
   ```bash
   # Check if Railway CLI is available
   railway logs
   ```

## API Health Check

Test the production API:

```bash
# Check health endpoint
curl https://learnx-production-3bf1.up.railway.app/api/v1/health

# Ask tutor a question (with auth if required)
curl -X POST https://learnx-production-3bf1.up.railway.app/api/v1/tutor/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is machine learning?", "context":"General learner"}'
```

## Environment Variables Reference

### Frontend (.env.local / .env.production)
| Variable | Purpose | Dev Value | Prod Value |
|----------|---------|-----------|-----------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:8080/api/v1` | `https://learnx-production-3bf1.up.railway.app/api/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | Database URL | Shared | `https://mbvgxpcmvcgyvjlauipm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase auth key | Shared | `sb_publishable_IrvljfJvZ-Ld9aBOvUqiyA_FLSW299T` |

### Backend (.env.local)
| Variable | Purpose | Example |
|----------|---------|---------|
| `LEARNX_ENV` | Runtime mode | `dev` or `prod` |
| `LEARNX_DB_URL` | Database connection | `jdbc:postgresql://localhost:5432/learnx` |
| `LEARNX_GEMINI_API_KEY` | Google Gemini API | (from Google Cloud) |
| `LEARNX_TAVILY_API_KEY` | Search API | (from Tavily) |

## Troubleshooting

### Frontend can't reach backend
- Local dev: Check `http://localhost:8080` is running
- Production: Check `NEXT_PUBLIC_API_URL=https://learnx-production-3bf1.up.railway.app/api/v1`
- CORS: Backend must allow frontend origin

### Database connection fails
- Verify Supabase credentials in `.env.local`
- Check database is running (`docker-compose ps`)
- Test with: `psql postgresql://user:pass@host:5432/learnx`

### Build fails during deployment
- Check `.env.production` has all required keys
- Run locally first: `npm run build`
- Check Next.js build logs

### Production API returning 5xx errors
- Check Railway logs at https://railway.app
- Verify database connection string
- Check API keys (Gemini, Tavily)

## Quick Reference

| Task | Command |
|------|---------|
| Start local backend | `mvn spring-boot:run` |
| Start local frontend | `npm run dev` (in web/) |
| Build frontend | `npm run build` (in web/) |
| Deploy frontend | `vercel --prod` |
| Check prod API | `curl https://learnx-production-3bf1.up.railway.app/api/v1/health` |
| View Railway logs | `railway logs` |
| Start docker db | `docker-compose up -d` |

---

**Current Status:**
- ✅ Backend: Running on Railway
- 🔌 Frontend: Ready to deploy to Vercel
- 🗄️ Database: Connected (Supabase)
- 📡 API: https://learnx-production-3bf1.up.railway.app/api/v1
