import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Application } from '../../../types';

export function useApplicationDetails(id?: string) {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchApplication() {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            application_status_history (
              id,
              status,
              notes,
              created_at
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setApplication(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [id]);

  return { application, loading, error };
}