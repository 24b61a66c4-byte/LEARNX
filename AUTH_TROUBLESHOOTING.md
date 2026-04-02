# Authentication Troubleshooting Guide

**Quick Diagnosis for Login & Auth Issues**

## Symptom: Can't Log In (Frontend)

### Step 1: Check Supabase Auth is Enabled

1. Go to Supabase Dashboard → Your Project
2. Go to **Authentication → Providers**
3. Verify Email/Password is **Enabled** (toggle should be green)
4. Verify Google/OAuth (if configured) is enabled

❌ **If disabled**: Click toggle to enable

### Step 2: Check Frontend Environment Variables

In Vercel (or local `.env.local`), verify these are correct:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...  # Should be a long JWT-like string
```

Find correct values:
1. Go to Supabase Dashboard → Settings → API
2. Copy **Project URL** (paste as `NEXT_PUBLIC_SUPABASE_URL`)
3. Copy **anon public key** (paste as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)

### Step 3: Check Browser Console for Errors

1. Open browser **DevTools (F12)** → **Console tab**
2. Try to sign in
3. Look for errors like:
   - `"error": "invalid_request_uri"`
   - `"error": "invalid_client_id"`
   - `CORS error` → `Origin not allowed`

**Fix**:
- For redirect URI errors: Go to Supabase → **Authentication → URL Configuration** → Add callback URLs:
  ```
  http://localhost:3000 (local dev)
  https://your-vercel-app.vercel.app (production)
  https://your-custom-domain.com (if using custom domain)
  ```

- For CORS errors: Ensure Supabase dashboard has "http://localhost:3000" or your Vercel domain in URL config

### Step 4: Test Supabase Auth Directly

Open browser console and run:

```javascript
const { createClient } = window.supabase;
const supabase = createClient(
  "https://YOUR_PROJECT_REF.supabase.co",
  "your-anon-key"
);

// Try to sign up
const { data, error } = await supabase.auth.signUp({
  email: "test@example.com",
  password: "TestPassword123!"
});

console.log("Sign up result:", { data, error });
```

- ✅ If it works: UI issue, not Supabase
- ❌ If error `"invalid_response"`: Supabase auth is down or credentials wrong

---

## Symptom: Can Log In, But API Calls Fail (401 Unauthorized)

### Step 1: Check Backend JWT Configuration

In Railway (or local `.env.local`), one of these MUST be set:

```bash
# Option A: For Supabase (PRODUCTION)
LEARNX_JWT_ISSUER_URI=https://YOUR_PROJECT_REF.supabase.co/auth/v1
LEARNX_JWT_JWK_SET_URI=https://YOUR_PROJECT_REF.supabase.co/auth/v1/jwks

# Option B: For local development
LEARNX_JWT_SECRET=your-secret-key-at-least-32-chars-long

# DO NOT use both - pick one!
```

### Step 2: Verify JWT Token is Being Sent

1. Open **DevTools → Network tab**
2. Make an API call (e.g., get profile)
3. Find the HTTP request in Network tab
4. Look at **Request Headers** → **Authorization**

Should look like:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- ✅ If present: Token is being sent
- ❌ If missing: Frontend auth check failing, check browser console

### Step 3: Validate JWT Token

If token is present but API returns 401:

1. Copy the JWT token from **Authorization: Bearer eyJ...**
2. Go to [jwt.io](https://jwt.io)
3. Paste token in the **Encoded field**
4. In the **Decoded** section, verify:

```json
{
  "iss": "https://YOUR_PROJECT_REF.supabase.co/auth/v1",  ← Check this matches LEARNX_JWT_ISSUER_URI
  "sub": "uuid-of-user",                                   ← User ID
  "exp": 1234567890,                                       ← Expiration (should be in future)
  "aud": "authenticated"
}
```

**Common issues**:
- `exp` is in the past → Token expired, user needs to re-login
- `iss` doesn't match → Backend JWT config pointing to wrong Supabase instance
- `sub` is missing → Supabase issue, not our code

### Step 4: Check Backend Health

Call backend health endpoint:

```bash
curl https://your-railway-url/actuator/health
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

❌ **If db status is DOWN**: Database connection failed (see "Database Issues" section below)

### Step 5: Check Backend Logs

In Railway Dashboard:
1. Go to **Deployments → Current Deployment**
2. Go to **Logs**
3. Search for:
   ```
   ERROR
   JWT
   UnauthorizedUser
   SecurityFilterChain
   ```

---

## Symptom: Database Connection Failed

### Step 1: Verify Supabase Database is Running

1. Go to Supabase Dashboard → **Settings → Databases**
2. Check **Status** is green (running)
3. If red or yellow: Wait 5-10 minutes, Supabase may be restarting

### Step 2: Check Connection String

In Railway variables, check `LEARNX_DB_URL`:

```bash
# Should look like:
jdbc:postgresql://db.ABC123.supabase.co:5432/postgres?sslmode=require
                    ^^^^^^ Your project reference
```

To find correct reference:
1. Go to Supabase → Settings → Database
2. Copy Connection string (JDBC)
3. Paste into `LEARNX_DB_URL` at Railway

### Step 3: Verify Database Password

1. Go to Supabase Dashboard → **Settings → Database → Password**
2. Copy the password
3. Set in Railway as `LEARNX_DB_PASSWORD`

⚠️ **Don't include the `<` and `>` characters!**

### Step 4: Check IP Whitelist

Supabase may block IPs not in whitelist:

1. Go to Supabase → **Settings → Network → IP Whitelist**
2. Check if Railway's IP is allowed

If not:
- Click **+ Add IP whitelist entry**
- Enter `0.0.0.0/0` for development (allows all - ⚠️ less secure)
- Or add Railway's egress IP (provided by Railway)

### Step 5: Test Connection Directly

SSH into Railway container (or run locally):

```bash
# Install psql if needed: apt-get install postgresql-client
psql -h db.YOUR_PROJECT.supabase.co \
     -U postgres \
     -d postgres \
     -c "SELECT 1;"
```

If successful:
```
 ?column?
----------
        1
```

---

## Symptom: CORS Error in Browser

**Error message**:
```
Access to XMLHttpRequest at 'https://api.railway.app/api/v1/...'
from origin 'https://your-vercel-app.vercel.app' has been blocked by CORS policy
```

### Fix

In Railway environment variables, update `LEARNX_ALLOWED_ORIGINS`:

```bash
# For single domain:
LEARNX_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app

# For multiple domains:
LEARNX_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-custom-domain.com,http://localhost:3000
```

After updating, **redeploy** Railway (redeploy or push new code).

---

## Symptom: "JWT Decoder Not Configured" Error

**In Railway logs**:
```
IllegalStateException: JWT decoder is not configured. Set LEARNX_JWT_ISSUER_URI, LEARNX_JWT_JWK_SET_URI, or LEARNX_JWT_SECRET.
```

### Fix

You must set ONE of these in Railway variables:

```bash
# Production (Supabase):
LEARNX_JWT_ISSUER_URI=https://YOUR_PROJECT_REF.supabase.co/auth/v1
LEARNX_JWT_JWK_SET_URI=https://YOUR_PROJECT_REF.supabase.co/auth/v1/jwks

# OR Local development:
LEARNX_JWT_SECRET=your-secret-key-min-32-chars-abcdefghijklmnopqrstuvwxyz123456
```

**DO NOT set more than one** - pick either Supabase (for prod) or JWT_SECRET (for dev).

---

## Quick Diagnostic Checklist

When auth/DB is broken, check in this order:

- [ ] Supabase Dashboard shows "All Systems Operational"
- [ ] Can sign in on Supabase auth (test with demo app)
- [ ] Frontend env vars match Supabase credentials
- [ ] Backend health endpoint returns 200 OK
- [ ] `LEARNX_JWT_ISSUER_URI` or `LEARNX_JWT_SECRET` is set (not empty)
- [ ] `LEARNX_DB_URL` includes correct Supabase host
- [ ] `LEARNX_DB_PASSWORD` is correct (test in psql)
- [ ] `LEARNX_ALLOWED_ORIGINS` includes frontend domain
- [ ] JWT token in Authorization header is valid (check jwt.io)
- [ ] JWT token exp claim is in the future

If all above pass → Issue is likely in application code, check Railway logs for specific errors.

---

## Support

- **Supabase Issues**: [Status Page](https://status.supabase.com)
- **Railway Issues**: Check Railway dashboard logs
- **JWT Validation**: Use [jwt.io](https://jwt.io) to inspect tokens
- **Database Issues**: Test with psql directly to isolate network vs. credentials issue

