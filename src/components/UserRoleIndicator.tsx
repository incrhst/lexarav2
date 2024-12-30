import React from 'react';
import { Shield } from 'lucide-react';
import { cn } from '../utils/cn';
import type { UserRole } from '../types';

interface Props {
  role: UserRole;
  className?: string;
}

export default function UserRoleIndicator({ role, className }: Props) {
  const roleLabels = {
    admin: 'Administrator',
    processor: 'Processor',
    user: 'Registered User',
    public: 'Public User',
  };

  const roleStyles = {
    admin: 'bg-primary text-background',
    processor: 'bg-primary-light text-background',
    user: 'bg-primary-lighter text-background',
    public: 'bg-gray-200 text-primary',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Shield className="h-4 w-4" />
      <span className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        roleStyles[role]
      )}>
        {roleLabels[role]}
      </span>
    </div>
  );
}