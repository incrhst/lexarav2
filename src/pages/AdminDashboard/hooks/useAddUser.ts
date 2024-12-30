import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface AddUserData {
  email: string;
  fullName: string;
  role: 'admin' | 'processor' | 'user' | 'public';
  companyName?: string;
}

export function useAddUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addUser = async (data: AddUserData) => {
    setLoading(true);
    setError(null);

    try {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: data.fullName,
          role: data.role,
          company_name: data.companyName,
        });

      if (profileError) throw profileError;

      // TODO: Send email with temporary password
      // For now, we'll just log it to console
      console.log('Temporary password:', tempPassword);

    } catch (err) {
      console.error('Error adding user:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    addUser,
    loading,
    error,
  };
}