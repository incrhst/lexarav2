import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Application } from '../../../types';

export function useClientApplications(clientId?: string) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clientId) return;

    async function fetchApplications() {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApplications(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [clientId]);

  return { applications, loading, error };
}