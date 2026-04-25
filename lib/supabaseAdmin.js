import { createClient } from "@supabase/supabase-js";

/**
 * Admin client — uses the service role key. NEVER import in client code.
 * Bypasses RLS. Only use in API routes / server actions after validating admin.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
