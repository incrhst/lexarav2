import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Application, FilterState, SortConfig, SavedFilter } from '../types/portfolio';

export function usePortfolio() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    status: [],
    dateRange: { start: null, end: null },
    jurisdiction: [],
  });
  const [sort, setSort] = useState<SortConfig>({ field: 'filing_date', direction: 'desc' });
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    fetchApplications();
  }, [filters, sort]);

  const fetchApplications = async () => {
    try {
      let query = supabase
        .from('applications')
        .select('*')
        .order(sort.field, { ascending: sort.direction === 'asc' });

      // Apply filters
      if (filters.type.length > 0) {
        query = query.in('type', filters.type);
      }
      if (filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      if (filters.jurisdiction.length > 0) {
        query = query.in('jurisdiction', filters.jurisdiction);
      }
      if (filters.dateRange.start) {
        query = query.gte('filing_date', filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        query = query.lte('filing_date', filters.dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !searchHistory.includes(query)) {
      setSearchHistory((prev) => [query, ...prev].slice(0, 10));
    }
  };

  const saveFilter = (name: string) => {
    setSavedFilters((prev) => [...prev, { name, filters: { ...filters } }]);
  };

  const applyFilter = (filter: FilterState) => {
    setFilters(filter);
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      status: [],
      dateRange: { start: null, end: null },
      jurisdiction: [],
    });
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (!searchQuery) return true;

      const searchFields = [
        app.title,
        app.reference_number,
        app.owner_name,
        app.jurisdiction,
        app.status,
        app.type,
      ];

      return searchFields.some((field) =>
        field?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [applications, searchQuery]);

  return {
    applications: filteredApplications,
    loading,
    searchQuery,
    filters,
    sort,
    savedFilters,
    searchHistory,
    setSearchQuery: handleSearch,
    setFilters,
    setSort,
    saveFilter,
    applyFilter,
    clearFilters,
  };
} 