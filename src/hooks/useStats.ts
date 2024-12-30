import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Stats {
  totalApplications: number;
  underReview: number;
  published: number;
  registered: number;
}

const DEFAULT_STATS: Stats = {
  totalApplications: 0,
  underReview: 0,
  published: 0,
  registered: 0,
};

export function useStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchStats() {
      try {
        const { data: applications, error } = await supabase
          .from('applications')
          .select('status')
          .eq('applicant_id', user.id);

        if (error) throw error;

        const newStats = applications.reduce(
          (acc, app) => {
            acc.totalApplications++;
            if (app.status === 'underReview') acc.underReview++;
            if (app.status === 'published') acc.published++;
            if (app.status === 'registered') acc.registered++;
            return acc;
          },
          { ...DEFAULT_STATS }
        );

        setStats(newStats);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  return { stats, loading, error };
}