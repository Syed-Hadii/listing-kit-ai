# 🎯 Action Items: Production Deployment Checklist

**Last Updated:** April 25, 2026  
**Status:** READY FOR ACTION

---

## ✅ Build Status
- ✓ Next.js build: **PASSED** (0 errors)
- ✓ All 20 pages compiled successfully
- ✓ No TypeScript or linting errors
- ✓ CSS/JavaScript bundled optimally

---

## 🔴 CRITICAL - Must Complete Before Deployment

### 1. API Key Rotation (30 minutes)
**Why:** Your current keys are exposed in `.env.local`

#### Step 1: Rotate OpenAI (if using)
1. Go to https://platform.openai.com/account/api-keys
2. Delete old key
3. Create new API key
4. Copy and save securely

#### Step 2: Rotate Supabase Keys
1. Go to Supabase Dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Click **Regenerate** next to:
   - `anon public` key (update `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` key (update `SUPABASE_SERVICE_ROLE_KEY`)
5. Copy and save

#### Step 3: Update Local .env.local
```bash
# Save new keys locally
NEXT_PUBLIC_SUPABASE_URL=https://ouwgcnrpatvdwshfiswz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEW_KEY_HERE]
SUPABASE_SERVICE_ROLE_KEY=[NEW_KEY_HERE]
GEMINI_API_KEY=[NEW_KEY_HERE] (or OPENAI_API_KEY)
AI_PROVIDER=gemini
```

**⚠️ DO NOT commit .env.local to git!** It should be in `.gitignore`

---

### 2. Run Supabase Migrations (15 minutes)
**Why:** Database trigger and indexes needed for production

#### Step 1: Copy Full Schema
1. Open `supabase/schema.sql` in your editor
2. Copy ENTIRE file contents

#### Step 2: Run in Supabase
1. Go to Supabase Dashboard → **SQL Editor**
2. Create **New Query**
3. Paste the entire schema.sql content
4. Click **RUN**
5. Wait for completion (~10 seconds)
6. Confirm no errors in output

#### Step 3: Verify Tables Created
1. Go to **Database** → **Tables**
2. You should see:
   - ✓ user_profiles
   - ✓ marketing_kits
   - ✓ plan_requests
   - ✓ payments
   - ✓ notifications
   - ✓ credit_logs

---

### 3. Switch AI Provider (5 minutes)
**Current:** `AI_PROVIDER=mock` (testing only)

#### For Production Use:

**Option A: Google Gemini (RECOMMENDED)**
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=[YOUR_ROTATED_KEY]
```

**Option B: OpenAI**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=[YOUR_ROTATED_KEY]
```

**Option C: Anthropic Claude**
```env
AI_PROVIDER=claude
ANTHROPIC_API_KEY=[YOUR_ROTATED_KEY]
```

#### Test It:
```bash
npm run dev
# Go to http://localhost:3000/login
# Create test account
# Generate a kit
# Verify it works and credits deducted
```

---

## 🟠 HIGH PRIORITY - Before Going Live

### 4. Create Vercel Account & Deploy (30 minutes)

#### Step 1: Setup Vercel
```bash
npm install -g vercel
vercel login
vercel link
```

#### Step 2: Configure Environment Variables
1. Go to **Vercel Dashboard** → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add:
```
NEXT_PUBLIC_SUPABASE_URL=https://ouwgcnrpatvdwshfiswz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ROTATED_KEY]
SUPABASE_SERVICE_ROLE_KEY=[ROTATED_KEY]
AI_PROVIDER=gemini
GEMINI_API_KEY=[ROTATED_KEY]
```
4. Make sure `NEXT_PUBLIC_*` variables are marked as public

#### Step 3: Deploy
```bash
vercel --prod
```
Wait for deployment to complete. You'll get a URL like `https://listing-kit-ai.vercel.app`

---

### 5. Post-Deployment Testing (15 minutes)

**Test Checklist:**
- [ ] Visit your production URL
- [ ] Signup with test email
- [ ] Check: User profile created with 5 credits
- [ ] Generate a kit (use real API)
- [ ] Verify: 1 credit deducted
- [ ] View saved kits
- [ ] Check notifications
- [ ] Login/logout works
- [ ] Try upgrade plan (doesn't need to pay, just test flow)

**If Something Breaks:**
```bash
# Check Vercel logs
vercel logs --prod

# Check Supabase logs
# Dashboard → Logs

# Check browser console
# F12 → Console tab

# Common issues:
# - Wrong env var name (case-sensitive!)
# - Old credentials still being used
# - Database not migrated
```

---

## 🟡 MEDIUM PRIORITY - This Week

### 6. Setup Error Tracking (Sentry)
**Why:** Monitor production errors without guessing

1. Go to https://sentry.io
2. Create account / login
3. Create new project (select Next.js)
4. Copy your DSN
5. Add to Vercel env vars:
   ```
   SENTRY_DSN=[YOUR_DSN]
   ```
6. Errors will now be tracked automatically

---

### 7. Add Rate Limiting (Optional but Recommended)
**Why:** Prevent abuse of /api/generate endpoint

1. Install: `npm install @upstash/ratelimit`
2. Create Upstash account: https://upstash.com
3. Create a new Redis database
4. Add token to Vercel env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
5. Rate limit would be implemented in `/api/generate/route.js`

---

### 8. Setup Domain (If You Have One)
1. Update DNS records to point to Vercel
2. Go to Vercel → Project Settings → Domains
3. Add your custom domain
4. Follow DNS setup instructions
5. Wait for propagation (5-30 minutes)

---

## 📋 Timeline Summary

| Task | Time | Status |
|------|------|--------|
| Rotate Keys | 30 min | 🔴 TODO |
| Run Migrations | 15 min | 🔴 TODO |
| Switch AI Provider | 5 min | 🔴 TODO |
| Deploy to Vercel | 15 min | 🔴 TODO |
| Test Production | 15 min | 🔴 TODO |
| **TOTAL** | **~1.5 hours** | 🔴 READY |

---

## 🚀 Quick Command Reference

```bash
# Test locally
npm run dev

# Build for production
npm run build

# Check build size
npm run build  # See output

# Deploy to Vercel
vercel --prod

# Check production logs
vercel logs --prod

# View environment variables
vercel env ls
```

---

## ✅ Sign-Off Checklist

Before you consider yourself "live", confirm:

- [ ] API keys rotated
- [ ] Supabase migrations run
- [ ] AI provider set to real service
- [ ] Deployed to Vercel
- [ ] Test user signup works
- [ ] Test kit generation works
- [ ] Test credits deducted correctly
- [ ] Admin can see new user
- [ ] Production errors logged (if Sentry setup)
- [ ] Custom domain configured (optional)

**Once all checked:** 🎉 **You're in production!**

---

## 📞 Troubleshooting

### "Kit generation fails with error"
1. Check: Is AI provider set in Vercel env vars?
2. Check: Is the API key correct and rotated?
3. Check: Is the key for the right provider? (Don't use OpenAI key with `AI_PROVIDER=gemini`)
4. Check: Does the provider have available quota?

### "User signup doesn't create profile"
1. Did you run the Supabase migration with the trigger?
2. Check: `user_profiles` table exists in Supabase
3. Check: Trigger `on_auth_user_created` exists (Supabase → Database → Functions)

### "Credits not deducting"
1. Check: `/api/generate` is being called (check Network tab in DevTools)
2. Check: Database has correct user_id
3. Check: `update` query in `/api/generate/route.js` is working

### "Can't login in production"
1. Check: Supabase URLs are correct in Vercel env
2. Check: Anon key has correct permissions
3. Check: Cookies are being set (DevTools → Application → Cookies)

---

## 🎓 Learning Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

**Status:** Ready to deploy! 🚀

Contact support if you hit any blockers.

