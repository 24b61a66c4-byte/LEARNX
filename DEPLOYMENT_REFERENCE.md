# LearnX Deployment Reference

**Choose your scenario below for step-by-step setup guide**

---

## 📍 I'm Setting Up...

### 1️⃣ Local Development (My Machine)

**Goal**: Run the full LearnX stack locally using H2 in-memory database + Supabase auth

**Prerequisites**:
- Java 21+ installed
- Maven 3.9.14+ installed
- Node.js 20.9+ installed
- Supabase project created

**Steps**:
1. Copy `.env.local` from `.env.example`
2. Set `LEARNX_JWT_SECRET` to a 32+ char string
3. Add Supabase URL and publishable key to `web/.env.local`
4. Run backend: `mvn spring-boot:run`
5. Run frontend: `cd web && npm run dev`
6. Visit `http://localhost:3000`

**Guide**: See [DATABASE_AUTH_FIX_SUMMARY.md](./DATABASE_AUTH_FIX_SUMMARY.md)

**Issues?** See [AUTH_TROUBLESHOOTING.md](./AUTH_TROUBLESHOOTING.md)

---

### 2️⃣ Production on Vercel + Railway + Supabase

**Goal**: Deploy production-ready app using:
- **Frontend**: Vercel (free tier okay)
- **Backend**: Railway (free tier has limited always-on time)
- **Database**: Supabase (free tier has 500MB storage)

**Prerequisites**:
- Vercel account (connected to GitHub)
- Railway account (connected to GitHub)
- Supabase account (project created)

**Your Deployment Architecture**:
```
User → Vercel (Next.js frontend)  
        ↓ HTTPS
        Railway (Spring Boot API)  
        ↓ JDBC
        Supabase PostgreSQL + Auth
```

**Steps**:

#### A. Deploy Backend to Railway

1. Log in to [railroad.app](https://railroad.app)
2. Create new project → Select GitHub repo
3. Select root directory (should auto-detect pom.xml)
4. Go to **Variables** tab
5. Add environment variables (see **Config Section** below)
6. Deploy → Should see "Build Successful" in logs

#### B. Deploy Frontend to Vercel

1. Log in to [vercel.com](https://vercel.com)
2. Create new project → Select GitHub repo
3. Framework: **Next.js**, Root Directory: **web**
4. Go to **Settings → Environment Variables**
5. Add:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url/api/v1
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<from Supabase API settings>
   ```
6. Deploy → Should see "Ready" status

#### C. Verify Everything Works

1. Visit your Vercel app
2. Sign in with email/password
3. Try to access a feature (profile, quiz, etc.)
4. Should work without errors

**Guide**: See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)

**Deployment Issues?** See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

---

### 3️⃣ Using Supabase Auth with Local Backend

**Goal**: Run backend locally but use Supabase auth issuer (instead of local JWT secret)

**Why**: Test production auth flow without deploying

**Config Root **:

Update `.env.local`:

```bash
# Keep database as H2 in-memory
LEARNX_DB_URL=jdbc:h2:mem:learnx;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE
LEARNX_DB_USERNAME=sa
LEARNX_DB_PASSWORD=

# Use Supabase auth instead
LEARNX_JWT_ISSUER_URI=https://YOUR_PROJECT_REF.supabase.co/auth/v1
LEARNX_JWT_JWK_SET_URI=https://YOUR_PROJECT_REF.supabase.co/auth/v1/jwks

# Clear the secret
# LEARNX_JWT_SECRET=
```

**Guide**: See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) → "Backend Environment Variables"

---

## 🔧 Configuration Sections

### Backend (Spring Boot / Railway)

**Required environment variables**:

```bash
LEARNX_ENV=prod                                    # or 'dev'
LEARNX_DB_URL=jdbc:postgresql://...               # Database connection
LEARNX_DB_USERNAME=postgres                       # DB user
LEARNX_DB_PASSWORD=...                            # DB password
LEARNX_JWT_ISSUER_URI=https://.../auth/v1        # Supabase JWT issuer
LEARNX_ALLOWED_ORIGINS=https://your-domain.com   # CORS allow-list
```

**Optional but recommended**:

```bash
LEARNX_GEMINI_API_KEY=...                         # AI tutoring
LEARNX_TAVILY_API_KEY=...                         # Search grounding
LEARNX_RATE_LIMIT_ENABLED=true                   # Rate limiting
```

**Where to find Supabase values**:
- `LEARNX_DB_URL`: Supabase Dashboard → Settings → Database → Connection String (JDBC)
- `LEARNX_JWT_ISSUER_URI`: Supabase Dashboard → Settings → API → Project URL + '/auth/v1'

### Frontend (Next.js / Vercel)

**Required environment variables**:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

**Where to find Supabase values**:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Dashboard → Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase Dashboard → Settings → API → "anon public key"

---

## 🚀 Quick Deploy Commands

### Local Development

```bash
# Terminal 1: Backend
mvn spring-boot:run

# Terminal 2: Frontend  
cd web && npm run dev

# Visit http://localhost:3000
```

### Production Docker

```bash
docker compose --env-file .env.local up --build
# Requires LEARNX_DB_URL pointing to PostgreSQL
```

---

## ❌ Common Issues & Quick Fixes

| Problem | Check This | Fix |
|---------|-----------|-----|
| "JWT not configured" | Railway logs | Set `LEARNX_JWT_ISSUER_URI` or `LEARNX_JWT_SECRET` |
| "Database connection failed" | Railway logs | Verify `LEARNX_DB_URL` and password are correct |
| "401 Unauthorized" on API calls | Browser DevTools → Network | JWT token missing or invalid - check Supabase auth |
| "CORS error" in browser | Browser console | Add frontend domain to `LEARNX_ALLOWED_ORIGINS` |
| "Can't sign in" | Frontend console | Verify `NEXT_PUBLIC_SUPABASE_URL` matches Supabase |
| "Deployment fails" | Railway/Vercel logs | Common: wrong folder, missing Maven, wrong JDK version |

**For detailed debugging**: See [AUTH_TROUBLESHOOTING.md](./AUTH_TROUBLESHOOTING.md)

---

## 📚 Full Documentation Index

| Document | Purpose |
|----------|---------|
| [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) | Complete setup for Vercel + Railway + Supabase |
| [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) | Pre-flight & post-deployment checklist |
| [AUTH_TROUBLESHOOTING.md](./AUTH_TROUBLESHOOTING.md) | Diagnose login & database issues |
| [DATABASE_AUTH_FIX_SUMMARY.md](./DATABASE_AUTH_FIX_SUMMARY.md) | Local dev setup with H2 + JWT |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | General deployment info (docker, environment) |
| [BACKEND_INTEGRATION_GUIDE.md](./docs/BACKEND_INTEGRATION_GUIDE.md) | Frontend ↔ Backend API integration details |

---

## 🆘 Get Help

1. **Check relevant guide above** based on your scenario
2. **Search [AUTH_TROUBLESHOOTING.md](./AUTH_TROUBLESHOOTING.md)** for your error
3. **Check service status pages**:
   - Supabase: [status.supabase.com](https://status.supabase.com)
   - Railway: Railway dashboard
   - Vercel: [vercel.com/status](https://vercel.com/status)

---

**Last Updated**: April 2, 2026  
**Version**: 1.0  
**Current Status**: ✅ All services configured for production
