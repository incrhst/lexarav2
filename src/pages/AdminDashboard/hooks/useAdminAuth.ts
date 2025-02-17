import { useAuth } from '../../../providers/AuthProvider';

export function useAdminAuth() {
  const { user, role, loading } = useAuth();
  return { isAdmin: role === 'admin', loading };
}