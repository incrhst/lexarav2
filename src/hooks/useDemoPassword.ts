import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserRole } from './useUserRole';

export function useDemoPassword() {
  const { role } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateDemoPassword = async (newPassword: string) => {
    if (role !== 'admin') {
      throw new Error('Only administrators can update demo passwords');
    }

    try {
      setLoading(true);
      const { error } = await supabase.rpc('set_demo_password', {
        new_password: newPassword,
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error updating demo password:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateDemoPassword,
    loading,
    error,
  };
}