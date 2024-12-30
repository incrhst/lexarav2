import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { UserRole } from '../types';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('public');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setRole('public');
      setLoading(false);
      return;
    }

    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    async function fetchUserRole() {
      try {
        // First try to get existing profile
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          // If profile not found, try to recover it
          if (error.code === 'PGRST116') {
            // Try to recover profile
            await supabase.rpc('recover_profile');
            
            // Wait briefly before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Retry getting the profile
            const { data: recoveredData, error: retryError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();

            if (retryError) {
              // If still failing after recovery, increment retry count
              retryCount++;
              if (retryCount < maxRetries) {
                // Wait with exponential backoff before retrying
                await new Promise(resolve => 
                  setTimeout(resolve, Math.pow(2, retryCount) * 500)
                );
                fetchUserRole();
                return;
              }
              throw retryError;
            }

            if (isMounted) {
              setRole(recoveredData.role);
            }
          } else {
            throw error;
          }
        } else if (isMounted) {
          setRole(data.role);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        if (isMounted) {
          setError(err as Error);
          // Default to 'user' role on error if authenticated
          setRole(user ? 'user' : 'public');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchUserRole();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { role, loading, error };
}