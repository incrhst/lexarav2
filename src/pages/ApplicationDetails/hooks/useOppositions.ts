import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Opposition } from '../../../types';

export function useOppositions(applicationId: string) {
  const [oppositions, setOppositions] = useState<Opposition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOppositions() {
      try {
        const { data, error } = await supabase
          .from('oppositions')
          .select('*')
          .eq('application_id', applicationId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOppositions(data || []);
      } catch (error) {
        console.error('Error fetching oppositions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOppositions();
  }, [applicationId]);

  return { oppositions, loading };
}