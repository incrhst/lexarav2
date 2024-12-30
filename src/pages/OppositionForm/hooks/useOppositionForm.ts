import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Application } from '../../../types';
import { useNavigate } from 'react-router-dom';

export function useOppositionForm(applicationId?: string) {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!applicationId) return;

    async function fetchApplication() {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('id', applicationId)
          .single();

        if (error) throw error;
        setApplication(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [applicationId]);

  const handleSubmit = async (data: any) => {
    if (!applicationId) return;

    try {
      const { error } = await supabase.from('oppositions').insert({
        application_id: applicationId,
        opponent_name: data.opponentName,
        reason: data.reason,
        evidence_urls: data.evidenceUrls,
        status: 'submitted',
      });

      if (error) throw error;
      navigate(`/applications/${applicationId}`);
    } catch (error) {
      console.error('Error submitting opposition:', error);
    }
  };

  return { application, loading, error, handleSubmit };
}