import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { AgentClient } from '../../../types';

export function useAgentClients() {
  const [clients, setClients] = useState<AgentClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        const { data, error } = await supabase
          .from('agent_clients')
          .select('*')
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
  }, []);

  const addClient = async (clientData: Omit<AgentClient, 'id' | 'agent_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('agent_clients')
        .insert(clientData)
        .select()
        .single();

      if (error) throw error;
      setClients([data, ...clients]);
      return data;
    } catch (err) {
      throw err;
    }
  };

  return { clients, loading, error, addClient };
}