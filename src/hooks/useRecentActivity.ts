import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Activity {
  id: string;
  description: string;
  created_at: string;
}

export function useRecentActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchActivity() {
      try {
        const { data, error } = await supabase
          .from('application_status_history')
          .select(`
            id,
            status,
            created_at,
            applications (
              trademark_name,
              filing_number
            )
          `)
          .eq('applications.applicant_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        const formattedActivities = (data || []).map((item) => ({
          id: item.id,
          description: `Application ${
            item.applications.trademark_name || item.applications.filing_number
          } status changed to ${item.status}`,
          created_at: item.created_at,
        }));

        setActivities(formattedActivities);
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [user]);

  return { activities, loading, error };
}