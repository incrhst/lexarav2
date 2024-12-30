import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from './Button';
import { useDemoMode } from '../hooks/useDemoMode';

export default function DemoLoginButton() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const [isLoading, setIsLoading] = React.useState(false);

  if (!isDemoMode) return null;

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo.user@example.com',
        password: 'Demo123!@#'
      });

      if (error) throw error;
      navigate('/');
    } catch (err) {
      console.error('Demo login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleDemoLogin}
      isLoading={isLoading}
      className="w-full"
    >
      Try Demo Account
    </Button>
  );
}