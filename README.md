# Listing Kit AI
**Powered by Saad's Production**

AI-powered SaaS platform for real estate agents. Agents enter property details and get a complete marketing kit — Instagram caption, reel script, email blast, ad copy, LinkedIn post, and MLS-style property description — in under 30 seconds.

Built with Next.js 14 App Router, Tailwind CSS, Supabase (Auth + DB + RLS), and Google Gemini as the default AI provider. Pluggable provider layer so you can switch to OpenAI or Claude with one env var.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) + React 18
- **Styling:** Tailwind CSS + custom luxury navy/gold theme
- **Auth + DB:** Supabase (with full Row Level Security policies)
- **AI:** Google Gemini (default), OpenAI + Anthropic adapters included
- **Payments:** Manual Payoneer workflow (no Stripe)
- **Deployment:** Vercel-ready

---

## Project Structure

```
listing-kit-ai/
├── app/
│   ├── api/
│   │   ├── admin/route.js            # Admin actions (credits, plans, payments, notifications)
│   │   ├── auth/signout/route.js
│   │   ├── generate/route.js         # AI kit generation (credit-gated)
│   │   ├── notifications/read/route.js
│   │   └── plan-request/route.js     # Create plan request + payment record
│   ├── admin/
│   │   ├── layout.js                 # Admin-only shell with role check
│   │   ├── page.js                   # Overview (users, MRR, etc.)
│   │   ├── users/page.js
│   │   ├── plan-requests/page.js
│   │   ├── payments/page.js
│   │   ├── kits/page.js
│   │   └── notifications/page.js
│   ├── dashboard/
│   │   ├── layout.js
│   │   ├── page.js                   # User overview
│   │   ├── new-kit/page.js
│   │   ├── kits/page.js
│   │   ├── kits/[id]/page.js
│   │   ├── billing/page.js
│   │   ├── notifications/page.js
│   │   └── settings/page.js
│   ├── login/page.js
│   ├── signup/page.js
│   ├── pricing/page.js
│   ├── page.js                       # Landing
│   ├── layout.js
│   └── globals.css
├── components/
│   ├── ui/                           # Button, Badge, Card, Modal, Logo, EmptyState
│   ├── dashboard/                    # Sidebar, Topbar (with notification bell)
│   └── landing/                      # MarketingNav, Footer
├── lib/
│   ├── aiProvider.js                 # Gemini/OpenAI/Claude abstraction + safe JSON parser
│   ├── prompts.js                    # Marketing kit prompt builder
│   ├── plans.js                      # Pricing plans constants
│   ├── supabaseAdmin.js              # Service-role client (server only)
│   ├── supabaseClient.js             # Browser client
│   ├── supabaseServer.js             # SSR client
│   └── utils.js
├── supabase/
│   └── schema.sql                    # Full schema + triggers + RLS
├── middleware.js                     # Auth & admin gating
├── .env.example
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
└── package.json
```

---

## 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, paste the entire contents of `supabase/schema.sql` and run it. This creates every table, trigger, helper function, and RLS policy.
3. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(server-only, never expose)*
4. In **Authentication → Providers**, make sure **Email** is enabled. For a quick start, disable "Confirm email" in Auth settings so signups work instantly in dev.

### Promote your admin user

After creating your first account through `/signup`, run this in Supabase SQL Editor:

```sql
update public.user_profiles
set role = 'admin'
where email = 'your-email@example.com';
```

Now `/admin` is accessible with that login.

---

## 2. Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create an API key.
2. Add it to `.env.local` as `GEMINI_API_KEY`.
3. Default model is `gemini-2.0-flash` (cheapest and fastest). Override via `GEMINI_MODEL`.

---

## 3. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env
cp .env.example .env.local
# Fill in all Supabase keys + GEMINI_API_KEY

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 4. Deploy to Vercel

1. Push the project to a Git repo (GitHub/GitLab/Bitbucket).
2. Import the repo into [Vercel](https://vercel.com).
3. Framework preset: **Next.js** (auto-detected).
4. Add the following environment variables in the Vercel project settings:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   GEMINI_API_KEY
   NEXT_PUBLIC_APP_URL          # your production URL, e.g. https://listingkit.ai
   ```

5. Deploy. That's it.

---

## 5. Switching AI Provider

The provider is selected at runtime by the `AI_PROVIDER` env var. Everything else stays the same — same prompt, same JSON schema, same route.

### Gemini (default)
```
AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash   # optional
```

### OpenAI
```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini        # optional
```

### Claude
```
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-latest   # optional
```

No code changes. Just redeploy. All three providers are fully implemented inside `lib/aiProvider.js`.

---

## 6. Credits & Manual Payoneer Workflow

- Every new user starts on the `free_trial` plan with **5 credits**.
- Each successful generation costs **1 credit**. Failed generations do **not** charge.
- Regenerating a kit costs 1 credit. Viewing/copying saved kits is free.

### Paid plan flow

1. User clicks a paid plan on `/dashboard/billing`.
2. `POST /api/plan-request` creates a `plan_requests` row (`status = pending`) and a matching `payments` row.
3. User sees: *"Your plan request has been sent. Saad's Production will send your secure Payoneer payment link inside your dashboard shortly."*
4. **Admin** goes to `/admin/plan-requests`, clicks **Link**, pastes the Payoneer payment URL, and clicks **Send link**. The user is notified instantly; the link appears on their Billing page.
5. After the user pays, admin clicks **Activate** — this marks the payment `paid`, activates the plan, and resets the user's credits to the plan allotment.

All statuses (`pending → payment_link_sent → paid → activated`) are tracked on both `plan_requests` and `payments` so you have a full audit trail.

---

## 7. Admin Capabilities

Only users with `user_profiles.role = 'admin'` can access `/admin` (enforced in middleware **and** by RLS + API server-side checks).

- **Overview** — live metrics: total users, active users (30d), free-trial count, active subs, pending requests, total kits, total credits used, estimated MRR, recent signups, recent plan requests.
- **Users** — search, filter, add/remove/reset credits, change plan, change subscription status, send notification, disable/enable.
- **Plan Requests** — paste Payoneer link, send to user, activate plan, cancel request.
- **Payments** — full history, filter by status, running total collected.
- **Generated Kits** — browse all kits across all users, view full content (for support).
- **Notifications** — send a custom notification to one user or broadcast to all users.

---

## 8. Security Summary

- **RLS on every table** — users can only read/write their own rows; admin bypasses via `is_admin()` helper.
- **`SUPABASE_SERVICE_ROLE_KEY` is server-only** — never imported in any client component. Used in `/api/generate` (to deduct credits atomically) and `/api/admin` (after the session role is verified as admin).
- **`GEMINI_API_KEY` is server-only** — the frontend never calls Gemini directly; all AI calls go through `/api/generate`.
- **Middleware gating** — `/dashboard/*` requires login; `/admin/*` requires `role = admin`; disabled users are force-logged-out.
- **Credit refund on failure** — if the AI errors or returns malformed JSON, the credit is not deducted.
- **One pending request** — users can't stack multiple plan requests simultaneously.

---

## 9. Testing Checklist

Before pushing to production, verify each item:

**Auth**
- [ ] `/signup` creates a user and auto-creates a `user_profiles` row via the trigger
- [ ] New user has 5 credits and `current_plan = 'free_trial'`
- [ ] `/login` redirects to `/dashboard` on success
- [ ] Logged-in user visiting `/login` is bounced to `/dashboard`
- [ ] Logged-out user visiting `/dashboard` is bounced to `/login`

**Generation**
- [ ] `/dashboard/new-kit` generates a kit successfully
- [ ] Credits decrement by exactly 1 on success
- [ ] Failed generation (e.g. bad API key) does NOT decrement credits
- [ ] Kit auto-saves and appears in `/dashboard/kits`
- [ ] Copy buttons copy each section and "Copy Full Kit" works
- [ ] At 3 credits remaining, a low-credit notification is sent
- [ ] At 0 credits, generation is blocked with 402 error

**Kits**
- [ ] Kit detail page shows all 6 sections
- [ ] Regenerate button creates a new kit and redirects
- [ ] Delete button removes the kit permanently

**Billing**
- [ ] Clicking a paid plan creates a `plan_requests` row with `status = pending`
- [ ] A corresponding `payments` row is created
- [ ] User sees the "pending" state on the Billing page
- [ ] Attempting to submit a second request while one is pending returns 409

**Admin**
- [ ] Non-admin users are blocked from `/admin`
- [ ] Pasting a Payoneer link on a plan request notifies the user
- [ ] Link appears on user's Billing page
- [ ] "Activate" button marks payment paid, activates plan, sets credits to plan amount
- [ ] Add/remove/reset credits works and logs to `credit_logs`
- [ ] Disable user logs them out on next request
- [ ] Broadcast notification reaches all users

**Security**
- [ ] Opening dev-tools network tab, `GEMINI_API_KEY` is never present in any request
- [ ] Direct Supabase queries from the browser are blocked by RLS for other users' data
- [ ] `/api/admin` returns 403 when called without an admin session

**Responsive**
- [ ] Landing, dashboard, and admin all look correct at 375px width
- [ ] Mobile sidebar drawer opens/closes
- [ ] Forms and tables scroll correctly on mobile

---

## 10. Notes

- **Email confirmations:** For production, re-enable "Confirm email" in Supabase Auth and set up an SMTP provider (Resend/Postmark/SendGrid).
- **Realtime:** The notification bell uses Supabase Realtime (`postgres_changes`). Make sure the `notifications` table has Realtime enabled in Supabase → Database → Replication.
- **Rate limits:** Consider adding rate limiting (Upstash/Vercel) to `/api/generate` in production.
- **Logging:** All AI failures are logged to `console.error` — pipe stderr to a logging service (Logtail, Axiom) on Vercel.

---

© Listing Kit AI · Powered by **Saad's Production**
