import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test function to verify connection
export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key exists:', !!supabaseKey);
  
  try {
    // First test basic connection
    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    if (userError) {
      console.error('Initial connection test error:', userError.message);
      if (userError.message.includes('authentication')) {
        console.error('❌ Authentication failed. Check your SUPABASE_ANON_KEY');
      } else if (userError.message.includes('does not exist')) {
        console.error('❌ User roles table not found. Run the migrations first.');
      }
      return false;
    }

    // Then test applications table
    const { data, error } = await supabase
      .from('applications')
      .select('count')
      .single();

    if (error) {
      console.error('Applications table test error:', error.message);
      if (error.message.includes('does not exist')) {
        console.error('❌ Applications table not found. Run the migrations first.');
      }
      return false;
    }

    console.log('✅ Supabase connection successful!');
    console.log('✅ Database tables exist and are accessible');
    return true;
  } catch (err) {
    console.error('Unexpected error during connection test:', err);
    return false;
  }
}