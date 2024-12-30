import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { AgentClient } from '../../../types';

export function useAgentClient(clientId?: string) {
  const [client, setClient] = useState<AgentClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clientId) return;

    async function fetchClient() {
      try {
        const { data, error } = await supabase
          .from('agent_clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (error) throw error;
        setClient(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchClient();
  }, [clientId]);

  return { client, loading, error };
}