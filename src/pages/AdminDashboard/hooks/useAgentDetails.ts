import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface AgentDetails {
  id: string;
  full_name: string;
  email: string;
  company_name?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export function useAgentDetails(agentId?: string) {
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!agentId) return;

    async function fetchAgent() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', agentId)
          .eq('role', 'agent')
          .single();

        if (error) throw error;
        setAgent(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchAgent();
  }, [agentId]);

  return { agent, loading, error };
}