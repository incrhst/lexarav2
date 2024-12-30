import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Application } from '../../../types';
import { AdminFilters } from '../types';

const DEFAULT_FILTERS: AdminFilters = {
  status: '',
  dateRange: '30',
  search: '',
};

export function useApplicationManagement() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filters, setFilters] = useState<AdminFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        let query = supabase
          .from('applications')
          .select('*')
          .order('filing_date', { ascending: false });

        if (filters.status) {
          query = query.eq('status', filters.status);
        }

        if (filters.search) {
          query = query.or(
            `trademark_name.ilike.%${filters.search}%,filing_number.ilike.%${filters.search}%,applicant_name.ilike.%${filters.search}%`
          );
        }

        if (filters.dateRange !== 'all') {
          const daysAgo = new Date();
          daysAgo.setDate(daysAgo.getDate() - parseInt(filters.dateRange));
          query = query.gte('filing_date', daysAgo.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;
        setApplications(data || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [filters]);

  const updateApplicationStatus = async (
    applicationId: string,
    status: Application['status'],
    notes?: string
  ) => {
    try {
      const { error } = await supabase.rpc('update_application_status', {
        application_id: applicationId,
        new_status: status,
        notes,
      });

      if (error) throw error;

      // Refresh the applications list
      setFilters({ ...filters });
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  };

  return {
    applications,
    filters,
    setFilters,
    loading,
    updateApplicationStatus,
  };
}