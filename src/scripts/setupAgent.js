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

async function setupAgent() {
  try {
    console.log('Creating agent user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'agent@lexara.com',
      password: 'Agent123!',
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No user data returned');
    }

    console.log('Agent user created successfully');
    console.log('Adding agent role...');

    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([{ user_id: authData.user.id, role: 'agent' }]);

    if (roleError) {
      throw roleError;
    }

    console.log('Agent role added successfully');
    console.log('Setup completed successfully!');
    console.log('\nAgent Credentials:');
    console.log('Email: agent@lexara.com');
    console.log('Password: Agent123!');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

setupAgent(); 