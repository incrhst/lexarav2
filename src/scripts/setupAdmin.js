import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdmin() {
  try {
    console.log('Creating admin user...');
    
    // First check if the user already exists
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email: 'admin@lexara.com',
      password: 'Admin123!'
    });

    let userId;

    if (existingUser?.user) {
      console.log('Admin user already exists');
      userId = existingUser.user.id;
    } else {
      // Create new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'admin@lexara.com',
        password: 'Admin123!',
        options: {
          data: {
            role: 'admin'
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      userId = authData.user.id;
      console.log('Admin user created successfully');
    }

    console.log('Adding admin role...');

    // Check if role already exists
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingRole) {
      console.log('Admin role already exists');
    } else {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' }]);

      if (roleError) {
        throw roleError;
      }
      console.log('Admin role added successfully');
    }

    console.log('Setup completed successfully!');
    console.log('\nAdmin Credentials:');
    console.log('Email: admin@lexara.com');
    console.log('Password: Admin123!');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

setupAdmin(); 