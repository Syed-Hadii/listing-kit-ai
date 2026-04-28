// scripts/seed-users.js
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

const usersToCreate = [
  {
    email: "saadsahab410@gmail.com",
    password: "$29@E}g1#5v",
    role: "admin",
  }, 
];

async function seedUsers() {
  console.log('Starting to seed users...');

  for (const userData of usersToCreate) {
    try {
      // 1. Create the user in auth.users
      console.log(`Creating user: ${userData.email}...`);
      const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // This auto-confirms the user
      });

      if (createError) {
        // Check if user already exists
        if (createError.message.includes('already exists')) {
          console.warn(`User ${userData.email} already exists. Skipping creation.`);
          continue;
        }
        throw new Error(`Failed to create user ${userData.email}: ${createError.message}`);
      }

      if (!authUser || !authUser.user) {
        throw new Error(`User object not returned for ${userData.email}.`);
      }

      console.log(`User ${userData.email} created successfully.`);

      // 2. If the role is 'admin', update the user_profiles table
      if (userData.role === 'admin') {
        console.log(`Assigning 'admin' role to ${userData.email}...`);
        const { error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update({ role: 'admin' })
          .eq('id', authUser.user.id);

        if (updateError) {
          throw new Error(`Failed to set admin role for ${userData.email}: ${updateError.message}`);
        }
        console.log(`Admin role assigned to ${userData.email}.`);
      }
    } catch (error) {
      console.error(`❌ An error occurred with user ${userData.email}:`, error.message);
      // Stop the script if one user fails
      return;
    }
  }

  console.log('✅ User seeding complete!');
}

seedUsers();
