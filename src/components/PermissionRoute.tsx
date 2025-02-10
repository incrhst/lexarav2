import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionRouteProps {
  requiredPermissions: string[];
  requireAll?: boolean;
  redirectTo?: string;
}

export default function PermissionRoute({
  requiredPermissions,
  requireAll = false,
  redirectTo = '/login',
}: PermissionRouteProps) {
  const { loading, hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Checking permissions...</div>
      </div>
    );
  }

  const hasAccess = requireAll
    ? hasAllPermissions(requiredPermissions)
    : hasAnyPermission(requiredPermissions);

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
} 