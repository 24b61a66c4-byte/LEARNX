# Production Deployment Checklist

**Quick reference for Railway + Vercel + Supabase setup**

## Pre-Deployment Checklist

- [ ] Supabase project created and running
- [ ] Supabase PostgreSQL database initialized
- [ ] Supabase Auth enabled
- [ ] Railway project linked to GitHub repo
- [ ] Vercel project linked to GitHub repo (web/ folder)
- [ ] All team members have access credentials

## Railway Backend Setup

- [ ] `LEARNX_ENV=prod` set
- [ ] `LEARNX_DB_URL` points to Supabase PostgreSQL
  - Format: `jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require`
- [ ] `LEARNX_DB_USERNAME=postgres` and password set
- [ ] `LEARNX_JWT_ISSUER_URI=https://xxx.supabase.co/auth/v1` set
- [ ] `LEARNX_ALLOWED_ORIGINS` includes Vercel domain
- [ ] Health check passes: `GET /actuator/health` → 200 OK
- [ ] Build succeeds in Railway logs
- [ ] No "JWT decoder is not configured" errors

## Vercel Frontend Setup

- [ ] `NEXT_PUBLIC_API_URL` points to Railway backend URL
  - Format: `https://your-railway-url/api/v1`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` matches Supabase project URL
  - Format: `https://xxx.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set (from Settings → API → anon key)
- [ ] Build succeeds in Vercel logs
- [ ] Frontend loads and shows Supabase auth UI
- [ ] Can sign in / sign up
- [ ] No CORS errors in browser console

## Database Verification

- [ ] Supabase has 3 migration tables created:
  - `profiles`
  - `lessons`
  - `quiz_results`
  - `subjects` (subject catalog)
  - `subject_catalog` (JSON index)

To verify in Supabase SQL Editor:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

## API Integration Tests

Run these after deployment:

```bash
# 1. Backend health
curl https://your-railway-url/actuator/health

# 2. Backend metrics (requires auth header)
curl https://your-railway-url/actuator/metrics

# 3. Frontend can load
curl https://your-vercel-app.com/ | grep "React"

# 4. Test authenticated API call
# (Get JWT token from browser console after login)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-railway-url/api/v1/profiles/your-user-id
```

## Common Issues & Fixes

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Backend won't start | Missing JWT config | Set `LEARNX_JWT_ISSUER_URI` in Railway |
| 401 Unauthorized | JWT validation failed | Verify Supabase issuer URI matches |
| CORS error in browser | Origin not in allow-list | Add Vercel domain to `LEARNX_ALLOWED_ORIGINS` |
| Database connection failed | Wrong credentials or IP blocked | Check Supabase password + IP whitelist |
| Frontend can't reach API | Wrong API URL | Verify `NEXT_PUBLIC_API_URL` in Vercel |
| 500 errors on API calls | Database migrations failed | Check Flyway logs in Railway backend |

## Post-Deployment

- [ ] Monitor Railway logs for errors
- [ ] Monitor Vercel analytics for frontend issues
- [ ] Set up Supabase backup schedule
- [ ] Enable observability/tracing if needed
- [ ] Document credentials in secure vault (1Password, Vault, etc.)
- [ ] Set up alerts for backend/database failures
- [ ] Schedule regular database backups

## Rollback Plan

If something breaks in production:

1. **Frontend rollback** (Vercel):
   - Go to **Deployments**
   - Click previous stable build
   - Click **Promote to Production**

2. **Backend rollback** (Railway):
   - Stop current deployment
   - Redeploy previous commit

3. **Database rollback** (Supabase):
   - Restore from backup in Supabase Dashboard
   - Run migrations again

---

**Need Help?** See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) for detailed setup instructions.
