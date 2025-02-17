import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export interface Application {
  id: string;
  title: string;
  application_number: string;
  status: 'draft' | 'pending' | 'active' | 'completed' | 'rejected';
  type: 'trademark' | 'patent' | 'design' | 'copyright';
  filing_date: string;
  applicant_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  agent_id: string;
  documents: string[];
}

export function useApplications(filters?: {
  status?: Application['status'];
  type?: Application['type'];
}) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!user) {
      setApplications([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('applications')
        .select('*')
        .eq('agent_id', user.id);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const createApplication = async (applicationData: Partial<Application>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([
          {
            ...applicationData,
            agent_id: user.id,
            status: applicationData.status || 'draft',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setApplications(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating application:', err);
      throw err;
    }
  };

  const updateApplication = async (id: string, updates: Partial<Application>) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, ...data } : app))
      );

      return data;
    } catch (err) {
      console.error('Error updating application:', err);
      throw err;
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setApplications(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      console.error('Error deleting application:', err);
      throw err;
    }
  };

  return {
    applications,
    loading,
    error,
    createApplication,
    updateApplication,
    deleteApplication,
    refresh: fetchApplications,
  };
}