import React from 'react';
import { Shield } from 'lucide-react';
import { cn } from '../utils/cn';
import type { UserRole } from '../types';

interface Props {
  role: UserRole;
  className?: string;
}

export default function UserRoleIndicator({ role, className }: Props) {
  console.log('UserRoleIndicator rendering with role:', role);

  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrator',
    processor: 'Processor',
    user: 'Registered User',
    agent: 'Agent',
    public: 'Public User',
  };

  const roleStyles: Record<UserRole, string> = {
    admin: 'bg-primary text-background',
    processor: 'bg-primary-light text-background',
    user: 'bg-primary-lighter text-background',
    agent: 'bg-primary-light text-background',
    public: 'bg-gray-200 text-primary',
  };

  if (!roleLabels[role]) {
    console.warn('Unknown role:', role);
    return null;
  }

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