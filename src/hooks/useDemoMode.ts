import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { env } from '../config/env';

export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(env.VITE_DEMO_MODE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkDemoMode() {
      try {
        console.log('Checking demo mode status...');
        const { data, error } = await supabase.rpc('get_demo_mode');
        
        if (error) {
          console.error('Error checking demo mode:', error);
          throw error;
        }
        
        console.log('Demo mode status:', data);
        setIsDemoMode(data);
      } catch (err) {
        console.error('Error checking demo mode:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    checkDemoMode();
  }, []);

  const toggleDemoMode = async () => {
    try {
      setLoading(true);
      console.log('Toggling demo mode to:', !isDemoMode);
      
      const { data, error } = await supabase.rpc('toggle_demo_mode', {
        enable: !isDemoMode,
      });

      if (error) {
        console.error('Error toggling demo mode:', error);
        throw error;
      }

      console.log('Demo mode toggled successfully:', data);
      setIsDemoMode(!isDemoMode);
    } catch (err) {
      console.error('Error toggling demo mode:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isDemoMode,
    loading,
    error,
    toggleDemoMode,
  };
}