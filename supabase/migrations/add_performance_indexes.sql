-- Migration: Add database indexes for performance optimization
-- Run this in Supabase SQL editor

-- Indexes on commonly queried fields
CREATE INDEX IF NOT EXISTS idx_marketing_kits_user_id 
  ON public.marketing_kits(user_id);

CREATE INDEX IF NOT EXISTS idx_marketing_kits_created_at 
  ON public.marketing_kits(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
  ON public.user_profiles(email);

CREATE INDEX IF NOT EXISTS idx_plan_requests_user_status 
  ON public.plan_requests(user_id, status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON public.notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_credit_logs_user_id 
  ON public.credit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_user_id 
  ON public.payments(user_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_marketing_kits_user_created 
  ON public.marketing_kits(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_plan_requests_user_created 
  ON public.plan_requests(user_id, created_at DESC);
