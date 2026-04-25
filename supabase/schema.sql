-- =============================================================
-- LISTING KIT AI — SUPABASE COMPLETE SCHEMA
-- Run this entire file in the Supabase SQL Editor once.
-- =============================================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- =============================================================
-- TABLES
-- =============================================================

-- 1. user_profiles
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'user' check (role in ('user','admin')),
  current_plan text default 'free_trial',
  subscription_status text default 'free_trial',
  credits_remaining integer default 5,
  credits_used integer default 0,
  total_kits_generated integer default 0,
  is_disabled boolean default false,
  last_active_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. marketing_kits
create table if not exists public.marketing_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  property_type text,
  location text,
  price text,
  bedrooms text,
  bathrooms text,
  square_footage text,
  key_features text,
  property_description text,
  target_audience text,
  tone text,
  platform_focus text,
  language text,
  instagram_caption text,
  reel_script text,
  email_blast text,
  ad_copy text,
  linkedin_post text,
  property_description_output text,
  created_at timestamptz default now()
);

-- 3. plan_requests
create table if not exists public.plan_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  selected_plan text,
  plan_price numeric,
  plan_credits integer,
  status text default 'pending' check (status in ('pending','payment_link_sent','paid','cancelled','activated')),
  payoneer_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan_request_id uuid references public.plan_requests(id) on delete cascade,
  plan_name text,
  amount numeric,
  credits integer,
  payoneer_link text,
  status text default 'pending' check (status in ('pending','payment_link_sent','paid','cancelled')),
  marked_paid_at timestamptz,
  created_at timestamptz default now()
);

-- 5. notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  message text,
  type text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 6. credit_logs
create table if not exists public.credit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  action text,
  credits_change integer,
  reason text,
  created_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_kits_user on public.marketing_kits(user_id, created_at desc);
create index if not exists idx_plan_requests_user on public.plan_requests(user_id, created_at desc);
create index if not exists idx_plan_requests_status on public.plan_requests(status);
create index if not exists idx_payments_user on public.payments(user_id, created_at desc);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read, created_at desc);
create index if not exists idx_credit_logs_user on public.credit_logs(user_id, created_at desc);

-- =============================================================
-- HELPER FUNCTIONS
-- =============================================================

-- is_admin(): returns true if current auth.uid() has role=admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.user_profiles where id = auth.uid()),
    false
  );
$$;

-- updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_updated on public.user_profiles;
create trigger trg_user_profiles_updated
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_plan_requests_updated on public.plan_requests;
create trigger trg_plan_requests_updated
before update on public.plan_requests
for each row execute function public.set_updated_at();

-- handle_new_user(): auto-create profile after signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, full_name, role, current_plan, subscription_status, credits_remaining)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user',
    'free_trial',
    'free_trial',
    5
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

alter table public.user_profiles enable row level security;
alter table public.marketing_kits enable row level security;
alter table public.plan_requests enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.credit_logs enable row level security;

-- user_profiles policies
drop policy if exists "profiles_select_own_or_admin" on public.user_profiles;
create policy "profiles_select_own_or_admin" on public.user_profiles
for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.user_profiles;
create policy "profiles_update_own_or_admin" on public.user_profiles
for update using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.user_profiles;
create policy "profiles_insert_own" on public.user_profiles
for insert with check (auth.uid() = id or public.is_admin());

-- marketing_kits policies
drop policy if exists "kits_select_own_or_admin" on public.marketing_kits;
create policy "kits_select_own_or_admin" on public.marketing_kits
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "kits_insert_own" on public.marketing_kits;
create policy "kits_insert_own" on public.marketing_kits
for insert with check (auth.uid() = user_id);

drop policy if exists "kits_delete_own_or_admin" on public.marketing_kits;
create policy "kits_delete_own_or_admin" on public.marketing_kits
for delete using (auth.uid() = user_id or public.is_admin());

-- plan_requests policies
drop policy if exists "plan_requests_select_own_or_admin" on public.plan_requests;
create policy "plan_requests_select_own_or_admin" on public.plan_requests
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "plan_requests_insert_own" on public.plan_requests;
create policy "plan_requests_insert_own" on public.plan_requests
for insert with check (auth.uid() = user_id);

drop policy if exists "plan_requests_update_admin" on public.plan_requests;
create policy "plan_requests_update_admin" on public.plan_requests
for update using (public.is_admin());

-- payments policies
drop policy if exists "payments_select_own_or_admin" on public.payments;
create policy "payments_select_own_or_admin" on public.payments
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "payments_modify_admin" on public.payments;
create policy "payments_modify_admin" on public.payments
for all using (public.is_admin()) with check (public.is_admin());

-- notifications policies
drop policy if exists "notifications_select_own_or_admin" on public.notifications;
create policy "notifications_select_own_or_admin" on public.notifications
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "notifications_update_own_or_admin" on public.notifications;
create policy "notifications_update_own_or_admin" on public.notifications
for update using (auth.uid() = user_id or public.is_admin());

drop policy if exists "notifications_insert_admin" on public.notifications;
create policy "notifications_insert_admin" on public.notifications
for insert with check (public.is_admin() or auth.uid() = user_id);

-- credit_logs policies
drop policy if exists "credit_logs_select_own_or_admin" on public.credit_logs;
create policy "credit_logs_select_own_or_admin" on public.credit_logs
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "credit_logs_insert_admin_or_self" on public.credit_logs;
create policy "credit_logs_insert_admin_or_self" on public.credit_logs
for insert with check (auth.uid() = user_id or public.is_admin());

-- =============================================================
-- DONE. Next step: promote one user to admin manually with
-- update public.user_profiles set role='admin' where email='you@example.com';
-- =============================================================
