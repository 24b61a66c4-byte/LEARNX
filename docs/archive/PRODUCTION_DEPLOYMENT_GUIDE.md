# Production Deployment Guide: Vercel + Railway + Supabase

**Last Updated**: April 2, 2026  
**Deployment Status**: Production Configuration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────▼──────────────────┐
    │   Vercel (Frontend)           │
    │   - Next.js App at /web       │
    │   - Client-side Supabase Auth │
    └────────────────┬──────────────┘
                     │
                     │ HTTPS
                     │ (fetches /api/v1)
                     │
    ┌────────────────▼──────────────┐
    │   Railway (Backend)           │
    │   - Spring Boot Java API      │
    │   - JWT validation            │
    │   - Actuator &  metrics       │
    └────────────────┬──────────────┘
                     │
                     │ JDBC over SSL/TLS
                     │
    ┌────────────────▼──────────────┐
    │   Supabase (Database + Auth)  │
    │   - PostgreSQL database       │
    │   - JWT issuer & JWK provider │
    │   - RLS & row-level security  │
    └───────────────────────────────┘
```

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Project**
   - PostgreSQL database instance
   - Auth enabled
   - JWT signing credentials

2. **Railway Account**
   - Connected to GitHub
   - Environment variables accessible

3. **Vercel Account**
   - Connected to GitHub
   - Custom domain (optional)

---

## Step 1: Railway Backend Configuration

### 1.1 Set Environment Variables in Railway

In your Railway project dashboard, go to **Variables** and set:

```bash
# Core Settings
LEARNX_ENV=prod
SERVER_PORT=8080

# Database (Supabase PostgreSQL)
LEARNX_DB_URL=jdbc:postgresql://db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
LEARNX_DB_USERNAME=postgres
LEARNX_DB_PASSWORD=<your-supabase-database-password>

# Database Behavior
LEARNX_JPA_DDL_AUTO=validate
LEARNX_JPA_SHOW_SQL=false
LEARNX_JPA_FORMAT_SQL=false

# JWT / Supabase Authentication
LEARNX_JWT_ISSUER_URI=https://YOUR_PROJECT_REF.supabase.co/auth/v1
LEARNX_JWT_JWK_SET_URI=https://YOUR_PROJECT_REF.supabase.co/auth/v1/jwks

# CORS Configuration
LEARNX_FRONTEND_URL=https://your-vercel-app.vercel.app
LEARNX_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-custom-domain.com

# AI Providers (Optional)
LEARNX_GEMINI_API_KEY=<your-api-key>
LEARNX_GEMINI_MODEL=gemini-2.5-flash
LEARNX_TAVILY_API_KEY=<your-api-key>

# Rate Limiting
LEARNX_RATE_LIMIT_ENABLED=true
LEARNX_RATE_LIMIT_CAPACITY=120
LEARNX_RATE_LIMIT_REFILL_TOKENS=120
LEARNX_RATE_LIMIT_REFILL_MINUTES=1

# Observability
LEARNX_TRACING_SAMPLING=0.1
```

### 1.2 How to Find Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings → Database**
4. Copy the **Connection string** (JDBC format):
   ```
   jdbc:postgresql://db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
   ```
5. Database password is under **Settings → Database → Password**
6. Go to **Settings → API** to find `YOUR_PROJECT_REF`
7. JWT issuer URI:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1
   ```

### 1.3 Configure Railway Build & Deploy

In your Railway repo, ensure `Dockerfile` in root or `src/main/docker/Dockerfile` exists:

```dockerfile
FROM maven:3.9.14-eclipse-temurin-21 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn -q dependency:resolve
COPY src src
RUN mvn clean package -q -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/learnx-api-*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

Or set a custom start command in Railway:
```bash
mvn spring-boot:run -q -Dspring-boot.run.arguments="--server.port=${SERVER_PORT}"
```

---

## Step 2: Vercel Frontend Configuration

### 2.1 Set Environment Variables in Vercel

In Vercel project settings → **Environment Variables**, add:

```env
NEXT_PUBLIC_API_URL=https://your-railway-backend-url/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
```

**How to find Supabase keys**:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → **Settings → API**
3. Copy `Project URL` and `anon public key`

### 2.2 Configure Build Settings

Vercel should auto-detect Next.js, but verify:
- **Build Command**: `cd web && npm run build` ✓
- **Output Directory**: `web/.next` ✓
- **Node Version**: 20.x ✓

### 2.3 Custom Domain (Optional)

1. In Vercel: **Settings → Domains**
2. Add your custom domain
3. Update `LEARNX_ALLOWED_ORIGINS` in Railway with your domain

---

## Step 3: Supabase Database Setup

### 3.1 Ensure Tables Exist

The backend uses Flyway migrations. On first deploy, Flyway will:
1. Create the initial schema from `V1__initial_schema.sql`
2. Apply topic/quiz migrations from `V2__profile_topics_and_quiz_answer_breakdown.sql`
3. Seed catalog data from `V3__seed_subject_catalog.sql`

All migrations are in: `src/main/resources/db/migration/`

### 3.2 Enable Row-Level Security (Optional but Recommended)

If you want database-level access control, enable RLS in Supabase:

```sql
-- In Supabase SQL Editor
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_self_access" ON profiles
  FOR ALL USING (
    user_id = auth.uid()
  );
```

---

## Step 4: Verify Deployment

### 4.1 Health Check

Once deployed, verify the backend is running:

```bash
curl https://your-railway-backend-url/actuator/health
```

Expected response:
```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "livenessState": { "status": "UP" }
  }
}
```

### 4.2 API Test

Test an authenticated API call from frontend:
```bash
# After user logs in via Supabase Auth
curl -H "Authorization: Bearer <user-jwt-token>" \
  https://your-railway-backend-url/api/v1/profiles/<user-id>
```

### 4.3 Frontend Test

Visit your Vercel app:
- Should load Next.js frontend ✓
- Supabase auth modal appears ✓
- Can sign in / sign up ✓
- API calls to backend succeed ✓

---

## Troubleshooting

### Backend Won't Start

**Error**: `JWT decoder is not configured`
- **Fix**: Verify `LEARNX_JWT_ISSUER_URI` is set in Railway variables

**Error**: `Unable to connect to database`
- **Fix**: Check Supabase connection string and password in `LEARNX_DB_URL`
- Ensure IP whitelist in Supabase allows Railway's egress IP

**Error**: `Could not resolve host`
- **Fix**: Supabase down or incorrect project ref in connection string

### Frontend Can't Reach Backend

**Error**: CORS error in browser console
- **Fix**: Update `LEARNX_ALLOWED_ORIGINS` in Railway to match Vercel domain

**Error**: 401 Unauthorized on API calls
- **Fix**: Verify Supabase is issuing valid JWTs
- Check frontend `NEXT_PUBLIC_SUPABASE_URL` matches Supabase project URL

---

## Environment Variables Checklist

### Railway Backend (🔴 Required, 🟡 Optional)

- 🔴 `LEARNX_ENV=prod`
- 🔴 `LEARNX_DB_URL` (Supabase JDBC)
- 🔴 `LEARNX_DB_USERNAME` (postgres)
- 🔴 `LEARNX_DB_PASSWORD`
- 🔴 `LEARNX_JWT_ISSUER_URI` (Supabase)
- 🔴 `LEARNX_ALLOWED_ORIGINS` (Vercel domain)
- 🟡 `LEARNX_GEMINI_API_KEY`
- 🟡 `LEARNX_TAVILY_API_KEY`

### Vercel Frontend (🔴 Required)

- 🔴 `NEXT_PUBLIC_API_URL` (Railway backend)
- 🔴 `NEXT_PUBLIC_SUPABASE_URL`
- 🔴 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

---

## Scaling & Optimization

### Database Optimization
- Monitor Supabase disk usage
- Consider upgrading plan for production traffic
- Enable backups (auto-enabled in paid plans)

### Backend Optimization
- Monitor Railway CPU/Memory
- Increase dyno size if hitting limits
- Enable caching headers for API responses

### Frontend Optimization
- Vercel auto-enables Edge Caching for static assets
- Monitor Web Vitals in Vercel Analytics
- Use Supabase Realtime for live updates (optional)

---

## Support

For issues:
1. Check Railway logs: **Deployments → Logs**
2. Check Vercel logs: **Deployments → Logs**
3. Check Supabase status: Supabase Dashboard → **Status**
4. Review backend health: `GET /actuator/health`
5. Check JWT validity: Decode at [jwt.io](https://jwt.io)

