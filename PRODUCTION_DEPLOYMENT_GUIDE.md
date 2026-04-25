# 🚀 PRODUCTION DEPLOYMENT GUIDE - Listing Kit AI

## Pre-Deployment Checklist

### 1. Security & Environment

- [ ] **Rotate ALL API Keys** (critical - your keys are exposed)
  ```bash
  # Update these in Supabase & OpenAI dashboards:
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - OPENAI_API_KEY
  - NEXT_PUBLIC_SUPABASE_URL
  ```

- [ ] **Setup Production Environment Variables**
  ```bash
  # Create .env.production or .env.production.local with:
  NEXT_PUBLIC_SUPABASE_URL=<production_url>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<production_anon_key>
  SUPABASE_SERVICE_ROLE_KEY=<production_service_key>
  OPENAI_API_KEY=<production_key>
  NEXT_PUBLIC_APP_URL=https://yourdomain.com
  ```

- [ ] **Never commit secrets**
  ```bash
  # Ensure .gitignore has:
  .env.local
  .env.*.local
  .env.production.local
  ```

- [ ] **Enable Supabase RLS (Row Level Security)**
  ```sql
  -- Enable on all tables:
  ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE marketing_kits ENABLE ROW LEVEL SECURITY;
  ALTER TABLE plan_requests ENABLE ROW LEVEL SECURITY;
  ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  ALTER TABLE credit_logs ENABLE ROW LEVEL SECURITY;
  ```

### 2. Database Migrations

- [ ] **Run all migrations in Supabase**
  
  **Migration 1: User Profile Trigger**
  ```bash
  # File: supabase/migrations/add_user_profile_trigger.sql
  # Run in Supabase SQL Editor → File → Run
  ```

  **Migration 2: Database Indexes**
  ```bash
  # File: supabase/migrations/add_performance_indexes.sql
  # Run in Supabase SQL Editor
  ```

- [ ] **Verify migrations ran successfully**
  ```sql
  -- Check trigger exists:
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  
  -- Check indexes exist:
  SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
  ```

### 3. Code Updates

- [ ] **useSearchParams Suspense Fix** (already done in /app/login/page.js)
- [ ] **User Profile Creation** (already done - check supabase/migrations/)
- [ ] **Error Boundaries** (already done - added /app/dashboard/error.js & /app/admin/error.js)
- [ ] **Input Validation** (already done - added /lib/validation.js)
- [ ] **Verify all fixes compiled**
  ```bash
  npm run build
  # Should show: ✓ Compiled successfully
  ```

### 4. Build & Deployment

- [ ] **Test production build locally**
  ```bash
  npm run build
  npm run start
  # Visit http://localhost:3000 - test signup/login/kit generation
  ```

- [ ] **Fix any remaining build warnings**
  ```bash
  npm run lint
  ```

- [ ] **Deploy to Vercel** (Recommended for Next.js)
  ```bash
  # Via Vercel CLI:
  npm i -g vercel
  vercel --prod
  
  # Or connect GitHub to Vercel dashboard:
  # https://vercel.com/new
  ```

  **Set production environment variables in Vercel:**
  - Settings → Environment Variables
  - Add: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.

### 5. Post-Deployment Testing

- [ ] **Test signup flow**
  - Create new account
  - Verify email (if enabled)
  - Verify user_profiles entry created
  - Check 5 free credits assigned

- [ ] **Test login flow**
  - Login with new account
  - Verify redirect to dashboard
  - Check profile loads

- [ ] **Test kit generation**
  - Generate a marketing kit
  - Verify 1 credit deducted
  - Verify kit saved to database

- [ ] **Test plan upgrade**
  - Click upgrade plan
  - Verify plan request created

- [ ] **Test admin panel**
  - Login as admin
  - Verify can see user list
  - Test add/remove credits

- [ ] **Test error handling**
  - Try generation with no credits
  - Verify error message
  - Try invalid form input
  - Verify validation errors

### 6. Monitoring & Logging

- [ ] **Setup Error Tracking**
  ```bash
  # Install Sentry (recommended):
  npm install @sentry/nextjs
  
  # Create Sentry project at sentry.io
  # Add to app/layout.js:
  import * as Sentry from "@sentry/nextjs";
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
  ```

- [ ] **Setup Application Logging**
  ```javascript
  // Create lib/logger.js:
  export const log = {
    info: (msg, data) => console.log('[INFO]', msg, data),
    error: (msg, data) => console.error('[ERROR]', msg, data),
    warn: (msg, data) => console.warn('[WARN]', msg, data),
  };
  ```

- [ ] **Monitor API Health**
  - Setup Uptime monitoring (e.g., UptimeRobot)
  - Monitor critical routes: /api/generate, /api/auth

- [ ] **Setup Performance Monitoring**
  - Use Vercel Analytics
  - Monitor Core Web Vitals

### 7. Backup & Recovery

- [ ] **Supabase Backups**
  - Verify daily backups enabled
  - Test restore process

- [ ] **Database Backup Plan**
  - Automate daily exports
  - Store backups in secure location

### 8. Security Hardening

- [ ] **HTTPS/SSL**
  - Verify HTTPS enforced (Vercel auto-handles)
  - Check SSL certificate valid

- [ ] **CORS Configuration**
  ```javascript
  // In middleware.js or API routes:
  headers: {
    "Access-Control-Allow-Origin": "https://yourdomain.com",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  }
  ```

- [ ] **Rate Limiting**
  - Install Upstash (already in validation.js)
  - Add to /api/generate route

- [ ] **Input Sanitization**
  - Already added in lib/validation.js

- [ ] **SQL Injection Protection**
  - Supabase handles via parameterized queries ✓

- [ ] **CSRF Protection**
  - Next.js handles automatically ✓

### 9. Performance Optimization

- [ ] **Enable CDN Caching**
  ```javascript
  // next.config.js
  const nextConfig = {
    headers: () => [{
      source: '/api/:path*',
      headers: [{ key: 'Cache-Control', value: 'no-cache' }],
    }],
  };
  ```

- [ ] **Optimize Images**
  - Use next/image for static assets
  - Add image optimization

- [ ] **Code Splitting**
  - Already done with dynamic imports ✓

- [ ] **Database Connection Pooling**
  - Supabase handles automatically ✓

### 10. Content & Legal

- [ ] **Terms of Service** - Create and display
- [ ] **Privacy Policy** - Create and display
- [ ] **Cookie Consent** - Add cookie banner
- [ ] **Acceptable Use Policy** - Define for free tier

---

## Environment Variables Checklist

### Production Variables (.env.production)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (server-only)

# AI Provider
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxx (server-only)

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional - Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
LOG_LEVEL=info
```

### Vercel Environment Setup
1. Go to Project Settings → Environment Variables
2. Add all variables above
3. Set them for: Production, Preview, Development
4. Redeploy for changes to take effect

---

## Post-Launch Monitoring

### Daily Checks
- [ ] Check error tracking (Sentry/logs)
- [ ] Verify API health
- [ ] Check database performance
- [ ] Review user signups

### Weekly Checks
- [ ] Analyze user flow (signup → generation)
- [ ] Review failed generations
- [ ] Check payment requests

### Monthly Checks
- [ ] Database performance review
- [ ] Cost analysis (Supabase, OpenAI)
- [ ] User feedback review
- [ ] Security audit

---

## Rollback Plan

If critical issues arise:

```bash
# 1. Identify issue
# 2. Create fix branch and test locally
# 3. Merge to main
# 4. Vercel auto-deploys (or manual redeploy)
# 5. Monitor error rates for 1 hour
# 6. If critical: Revert last deploy via Vercel dashboard
```

---

## Estimated Timeline

- **Setup & Configuration**: 2-3 hours
- **Testing**: 2-3 hours
- **Deployment**: 1 hour
- **Post-launch Monitoring**: 1 week (active)

**Total Pre-Launch Time**: 5-7 hours

---

## Support & Escalation

If production issues:
1. Check error logs (Sentry/Vercel)
2. Review recent changes
3. Test in staging first
4. Rollback if necessary
5. Document incident

---

## Success Criteria

✅ All users can signup and login  
✅ Kit generation works end-to-end  
✅ Credits deduct correctly  
✅ Admin panel functions  
✅ No critical errors in logs  
✅ Page loads < 2 seconds  
✅ Zero downtime for 7 days  

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Status**: ___________

