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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function verifyUserExists(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return !!data;
}

async function setupAdmin() {
  try {
    console.log('Creating admin user...');
    
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

    const userId = authData.user.id;
    console.log('Admin user created successfully');

    // Create profile
    console.log('Creating admin profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email: 'admin@lexara.com',
        full_name: 'System Administrator',
        role: 'admin'
      }]);

    if (profileError) {
      throw profileError;
    }
    console.log('Admin profile created successfully');

    // Create role
    console.log('Adding admin role...');
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role: 'admin' }]);

    if (roleError) {
      throw roleError;
    }
    console.log('Admin role added successfully');

    console.log('\nSetup completed successfully!');
    console.log('\nAdmin Credentials:');
    console.log('Email: admin@lexara.com');
    console.log('Password: Admin123!');
    console.log('\nPlease check your email to confirm your account.');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

setupAdmin(); 