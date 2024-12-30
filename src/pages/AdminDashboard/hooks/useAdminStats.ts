import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface AdminStats {
  totalApplications: number;
  pendingReview: number;
  activeUsers: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalApplications: 0,
    pendingReview: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [applications, pendingReview, activeUsers] = await Promise.all([
          supabase.from('applications').select('id', { count: 'exact' }),
          supabase
            .from('applications')
            .select('id', { count: 'exact' })
            .eq('status', 'submitted'),
          supabase
            .from('profiles')
            .select('id', { count: 'exact' })
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        ]);

        setStats({
          totalApplications: applications.count || 0,
          pendingReview: pendingReview.count || 0,
          activeUsers: activeUsers.count || 0,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading };
}