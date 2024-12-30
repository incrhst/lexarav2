import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Agent {
  id: string;
  full_name: string;
  email: string;
  company_name?: string;
  created_at: string;
  client_count: number;
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            client_count:agent_clients(count)
          `)
          .eq('role', 'agent')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAgents(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchAgents();
  }, []);

  return { agents, loading, error };
}