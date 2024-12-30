import React from 'react';
import { Beaker } from 'lucide-react';
import { useDemoMode } from '../hooks/useDemoMode';
import { cn } from '../utils/cn';

interface Props {
  className?: string;
}

export default function DemoModeIndicator({ className }: Props) {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm',
      className
    )}>
      <Beaker className="h-4 w-4" />
      Demo Mode
    </div>
  );
}