// scripts/clear-db.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Ensure you have SUPABASE_SERVICE_ROLE_KEY in your .env.local
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function cleanDatabase() {
  console.log('Starting database cleanup...');

  const tablesToClean = [
    'marketing_kits',
    'user_profiles',
    'credit_logs',
    'notifications',
    'plan_requests',
    'payments',
  ];

  try {
    // Temporarily disable RLS on all tables to allow deletion
    console.log('Disabling Row Level Security...');
    for (const table of tablesToClean) {
      const { error } = await supabaseAdmin.rpc('eval', {
        query: `ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`,
      });
      if (error) throw new Error(`Failed to disable RLS on ${table}: ${error.message}`);
    }

    // Truncate all tables
    console.log('Truncating tables...');
    const truncateQuery = `TRUNCATE ${tablesToClean.join(', ')} RESTART IDENTITY CASCADE;`;
    const { error: truncateError } = await supabaseAdmin.rpc('eval', { query: truncateQuery });
    if (truncateError) throw new Error(`Failed to truncate tables: ${truncateError.message}`);
    console.log('All user-related tables have been cleared.');

    // Delete all users from auth.users
    console.log('Deleting all users from auth.users...');
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw new Error(`Failed to list users: ${usersError.message}`);

    for (const user of users.users) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Failed to delete user ${user.id}:`, deleteError.message);
      }
    }
    console.log('All users have been deleted from the authentication system.');

    // Re-enable RLS
    console.log('Re-enabling Row Level Security...');
    for (const table of tablesToClean) {
      const { error } = await supabaseAdmin.rpc('eval', {
        query: `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`,
      });
      if (error) throw new Error(`Failed to re-enable RLS on ${table}: ${error.message}`);
    }

    console.log('✅ Database cleanup successful! Your database is now empty.');
  } catch (error) {
    console.error('❌ An error occurred during cleanup:', error.message);
  }
}

cleanDatabase();
