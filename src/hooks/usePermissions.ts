import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Permission {
  role: string;
  permission_key: string;
  description: string;
}

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) throw roleError;

      const { data: permissionData, error: permissionError } = await supabase
        .from('role_permissions')
        .select('permission_key')
        .eq('role', roleData.role);

      if (permissionError) throw permissionError;

      setPermissions(permissionData.map(p => p.permission_key));
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback((requiredPermission: string) => {
    return permissions.includes(requiredPermission);
  }, [permissions]);

  const hasAnyPermission = useCallback((requiredPermissions: string[]) => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  }, [permissions]);

  const hasAllPermissions = useCallback((requiredPermissions: string[]) => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  }, [permissions]);

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refresh: fetchPermissions,
  };
} 