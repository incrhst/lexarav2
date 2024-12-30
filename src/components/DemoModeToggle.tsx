import React from 'react';
import { Beaker } from 'lucide-react';
import { useDemoMode } from '../hooks/useDemoMode';
import Button from './Button';

export default function DemoModeToggle() {
  const { isDemoMode, loading, toggleDemoMode } = useDemoMode();

  const handleToggle = async () => {
    try {
      await toggleDemoMode();
    } catch (error) {
      console.error('Failed to toggle demo mode:', error);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleToggle}
      isLoading={loading}
      className="flex items-center gap-2"
    >
      <Beaker className="h-4 w-4" />
      {isDemoMode ? 'Disable Demo Mode' : 'Enable Demo Mode'}
    </Button>
  );
}