const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdminUser() {
  try {
    console.log('Creating admin user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@lexara.com',
      password: 'abc123',
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No user data returned');
    }

    console.log('Admin user created successfully');
    console.log('Adding admin role...');

    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([{ user_id: authData.user.id, role: 'admin' }]);

    if (roleError) {
      throw roleError;
    }

    console.log('Admin role added successfully');
    console.log('Setup completed successfully!');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

setupAdminUser(); 