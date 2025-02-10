const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function setupAgent() {
  try {
    // Create agent user
    const { data: user, error: signUpError } = await supabase.auth.signUp({
      email: 'agent@lexara.com',
      password: 'Agent123!',
      options: {
        data: {
          role: 'agent'
        }
      }
    });

    if (signUpError) throw signUpError;
    
    // Insert into user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([
        {
          user_id: user.user.id,
          role: 'agent'
        }
      ]);

    if (roleError) throw roleError;

    console.log('Agent user created successfully!');
    console.log('Email: agent@lexara.com');
    console.log('Password: Agent123!');
    
  } catch (error) {
    console.error('Error setting up agent:', error.message);
  }
}

setupAgent(); 