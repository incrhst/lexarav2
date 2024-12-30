import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Application } from '../../../types';
import { GazetteFilters } from '../types';

const DEFAULT_FILTERS: GazetteFilters = {
  type: '',
  status: '',
  search: '',
  dateRange: '30',
};

export function useGazette() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GazetteFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    async function fetchApplications() {
      try {
        let query = supabase
          .from('applications')
          .select('*')
          .order('filing_date', { ascending: false });

        if (filters.type) {
          query = query.eq('application_type', filters.type);
        }

        if (filters.status) {
          query = query.eq('status', filters.status);
        }

        if (filters.search) {
          query = query.or(
            `trademark_name.ilike.%${filters.search}%,filing_number.ilike.%${filters.search}%`
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

  return { applications, filters, setFilters, loading };
}