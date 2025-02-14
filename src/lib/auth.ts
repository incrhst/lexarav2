import { supabase } from './supabase';

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

// Get the site URL from environment variables, fallback to localhost for development
const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';

export async function register(data: RegisterData) {
  try {
    // Sign up the user first
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (signUpError) {
      console.error('Signup error:', signUpError);
      throw signUpError;
    }

    if (!authData.user) {
      throw new Error('User creation failed');
    }

    // Try to create the profile, but don't block registration if it fails
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: data.fullName,
          email: data.email,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // We'll handle profile creation later if needed
      }
    } catch (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue anyway as the user is created
    }

    return authData;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already registered')) {
        throw new Error('User already registered');
      }
    }
    throw error;
  }
}