const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function setupAdmin() {
  try {
    // Create admin user
    const { data: user, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@lexara.com',
      password: 'Admin123!',
      options: {
        data: {
          role: 'admin'
        }
      }
    });

    if (signUpError) throw signUpError;
    
    // Insert into profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.user.id,
          email: 'admin@lexara.com',
          role: 'admin',
          full_name: 'System Administrator'
        }
      ]);

    if (profileError) throw profileError;

    console.log('Admin user created successfully!');
    console.log('Email: admin@lexara.com');
    console.log('Password: Admin123!');
    
  } catch (error) {
    console.error('Error setting up admin:', error.message);
  }
}

setupAdmin(); 