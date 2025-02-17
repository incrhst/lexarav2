import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: any;
  loading: boolean;
  error?: Error;
  role: string | null;
  updateProfile: (profileData: any) => Promise<void>;
  hasRole: (requiredRoles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  const role = auth.user && auth.user.user_metadata && auth.user.user_metadata.role
    ? auth.user.user_metadata.role
    : null;

  const updateProfile = async (profileData: any) => {
    const { data, error } = await supabase.auth.update({ data: profileData });
    if (error) {
      throw error;
    }
  };

  const hasRole = (requiredRoles: string | string[]): boolean => {
    if (!role) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(role);
    } else {
      return role === requiredRoles;
    }
  };

  useEffect(() => {
    console.log('AuthProvider mounted');
    console.log('Auth state:', {
      user: auth.user ? 'Logged in' : 'Not logged in',
      loading: auth.loading,
      role
    });
  }, [auth.user, auth.loading, role]);

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading authentication...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...auth, role, updateProfile, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRoles?: string | string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading, hasRole } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Validating access...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export function useAdminAuth() {
  const { user, hasRole } = useAuthContext();
  return { user, isAdmin: hasRole('admin') };
}

export function useAgentAuth() {
  const { user, hasRole } = useAuthContext();
  return { user, isAgent: hasRole('agent') };
}

export function useApplicantAuth() {
  const { user, hasRole } = useAuthContext();
  return { user, isApplicant: hasRole('applicant') };
} 