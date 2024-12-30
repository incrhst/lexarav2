import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from './Button';
import { useDemoMode } from '../hooks/useDemoMode';
import { UserCircle2, ShieldCheck, ClipboardCheck, UserCog } from 'lucide-react';

const DEMO_USERS = [
  {
    label: 'Demo User',
    email: 'demo.user@example.com',
    icon: UserCircle2,
  },
  {
    label: 'Demo Admin',
    email: 'demo.admin@example.com',
    icon: ShieldCheck,
  },
  {
    label: 'Demo Processor',
    email: 'demo.processor@example.com',
    icon: ClipboardCheck,
  },
  {
    label: 'Demo Agent',
    email: 'demo.agent@example.com',
    icon: UserCog,
  },
];

export default function DemoLoginOptions() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  if (!isDemoMode) return null;

  const handleDemoLogin = async (email: string) => {
    setLoading(email);
    setError(null);
    
    try {
      // First verify demo mode is enabled
      const { data: demoEnabled } = await supabase.rpc('is_demo_mode');
      if (!demoEnabled) {
        throw new Error('Demo mode is not enabled');
      }

      // Attempt demo login
      const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: 'Demo123!@#'
      });

      if (loginError) throw loginError;
      if (!user) throw new Error('No user data returned');

      // Success - navigate to dashboard
      navigate('/');
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded text-center">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        {DEMO_USERS.map(({ label, email, icon: Icon }) => (
          <Button
            key={email}
            variant="secondary"
            onClick={() => handleDemoLogin(email)}
            isLoading={loading === email}
            className="flex items-center justify-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}