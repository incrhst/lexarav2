import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Opposition {
  id: string;
  application_id: string;
  opponent_id: string;
  status: 'draft' | 'pending' | 'active' | 'resolved' | 'withdrawn';
  grounds: string;
  filing_date: string;
  resolution_date?: string;
  resolution_details?: string;
  documents: string[];
  created_at: string;
  updated_at: string;
}

export function useOppositions(filters?: {
  status?: Opposition['status'];
  applicationId?: string;
}) {
  const { user } = useAuth();
  const [oppositions, setOppositions] = useState<Opposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOppositions = useCallback(async () => {
    if (!user) {
      setOppositions([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('oppositions')
        .select(`
          *,
          applications (
            title,
            application_number,
            type
          )
        `)
        .eq('opponent_id', user.id);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.applicationId) {
        query = query.eq('application_id', filters.applicationId);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setOppositions(data || []);
    } catch (err) {
      console.error('Error fetching oppositions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    fetchOppositions();
  }, [fetchOppositions]);

  const createOpposition = async (oppositionData: Partial<Opposition>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('oppositions')
        .insert([
          {
            ...oppositionData,
            opponent_id: user.id,
            status: oppositionData.status || 'draft',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setOppositions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating opposition:', err);
      throw err;
    }
  };

  const updateOpposition = async (id: string, updates: Partial<Opposition>) => {
    try {
      const { data, error } = await supabase
        .from('oppositions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setOppositions(prev =>
        prev.map(opp => (opp.id === id ? { ...opp, ...data } : opp))
      );

      return data;
    } catch (err) {
      console.error('Error updating opposition:', err);
      throw err;
    }
  };

  const deleteOpposition = async (id: string) => {
    try {
      const { error } = await supabase
        .from('oppositions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOppositions(prev => prev.filter(opp => opp.id !== id));
    } catch (err) {
      console.error('Error deleting opposition:', err);
      throw err;
    }
  };

  return {
    oppositions,
    loading,
    error,
    createOpposition,
    updateOpposition,
    deleteOpposition,
    refresh: fetchOppositions,
  };
} 