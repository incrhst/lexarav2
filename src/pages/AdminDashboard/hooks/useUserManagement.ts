import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { User, UserFilterOptions } from '../types';

const DEFAULT_FILTERS: UserFilterOptions = {
  role: '',
  dateRange: '30',
  search: '',
};

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UserFilterOptions>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters.role) {
          query = query.eq('role', filters.role);
        }

        if (filters.search) {
          query = query.or(
            `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
          );
        }

        if (filters.dateRange !== 'all') {
          const daysAgo = new Date();
          daysAgo.setDate(daysAgo.getDate() - parseInt(filters.dateRange));
          query = query.gte('created_at', daysAgo.toISOString());
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [filters]);

  const updateUserRole = async (userId: string, role: User['role']) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;

      // Refresh the users list
      setFilters({ ...filters });
    } catch (err) {
      console.error('Error updating user role:', err);
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Refresh the users list
      setFilters({ ...filters });
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  return {
    users,
    filters,
    setFilters,
    loading,
    error,
    updateUserRole,
    deleteUser,
  };
}