import React from 'react';
import { Circle } from 'lucide-react';
import { cn } from '../utils/cn';

interface Props {
  className?: string;
}

export default function Logo({ className }: Props) {
  return (
    <div className={cn('flex items-center', className)}>
      <div className="relative">
        <Circle className="h-8 w-8 text-primary drop-shadow-[2px_2px_2px_rgba(0,0,0,0.1)]" />
      </div>
      <span className="ml-2 text-xl font-semibold text-primary">Lexara IP</span>
    </div>
  );
}