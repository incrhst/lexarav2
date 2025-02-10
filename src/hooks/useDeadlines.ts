import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Deadline {
  id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  entity_type: 'application' | 'opposition';
  entity_id: string;
  reminder_days: number[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useDeadlines(filters?: {
  completed?: boolean;
  entityType?: Deadline['entity_type'];
  entityId?: string;
}) {
  const { user } = useAuth();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDeadlines = useCallback(async () => {
    if (!user) {
      setDeadlines([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('deadlines')
        .select(`
          *,
          applications!entity_id (
            title,
            application_number
          ),
          oppositions!entity_id (
            grounds,
            filing_date
          )
        `)
        .eq('user_id', user.id);

      if (filters?.completed !== undefined) {
        query = query.eq('completed', filters.completed);
      }

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters?.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }

      const { data, error: fetchError } = await query
        .order('due_date', { ascending: true });

      if (fetchError) throw fetchError;

      setDeadlines(data || []);
    } catch (err) {
      console.error('Error fetching deadlines:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    fetchDeadlines();
  }, [fetchDeadlines]);

  const createDeadline = async (deadlineData: Partial<Deadline>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('deadlines')
        .insert([
          {
            ...deadlineData,
            user_id: user.id,
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setDeadlines(prev => [...prev, data].sort((a, b) => 
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      ));

      return data;
    } catch (err) {
      console.error('Error creating deadline:', err);
      throw err;
    }
  };

  const updateDeadline = async (id: string, updates: Partial<Deadline>) => {
    try {
      const { data, error } = await supabase
        .from('deadlines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDeadlines(prev =>
        prev.map(deadline => (deadline.id === id ? { ...deadline, ...data } : deadline))
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      );

      return data;
    } catch (err) {
      console.error('Error updating deadline:', err);
      throw err;
    }
  };

  const deleteDeadline = async (id: string) => {
    try {
      const { error } = await supabase
        .from('deadlines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDeadlines(prev => prev.filter(deadline => deadline.id !== id));
    } catch (err) {
      console.error('Error deleting deadline:', err);
      throw err;
    }
  };

  const toggleDeadlineCompletion = async (id: string) => {
    const deadline = deadlines.find(d => d.id === id);
    if (!deadline) return;

    try {
      await updateDeadline(id, { completed: !deadline.completed });
    } catch (err) {
      console.error('Error toggling deadline completion:', err);
      throw err;
    }
  };

  return {
    deadlines,
    loading,
    error,
    createDeadline,
    updateDeadline,
    deleteDeadline,
    toggleDeadlineCompletion,
    refresh: fetchDeadlines,
  };
} 