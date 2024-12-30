import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Client {
  id: string;
  client_name: string;
  company_name: string;
  contact_email?: string;
  country?: string;
  created_at: string;
  application_count: number;
}

export function useAgentClients(agentId: string) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        const { data, error } = await supabase
          .from('agent_clients')
          .select(`
            *,
            application_count:applications(count)
          `)
          .eq('agent_id', agentId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, [agentId]);

  return { clients, loading, error };
}