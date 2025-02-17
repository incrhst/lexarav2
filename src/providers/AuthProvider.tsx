import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Navigate, useLocation } from 'react-router-dom';

type UserRole = 'admin' | 'processor' | 'user' | 'agent' | 'public' | 'applicant';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error?: Error;
  role: UserRole;
  updateProfile: (profileData: any) => Promise<void>;
  hasRole: (requiredRoles: UserRole | UserRole[]) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('public');

  const updateProfile = async (profileData: any) => {
    const { error } = await supabase.auth.updateUser({ data: profileData });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(role);
    }
    return role === requiredRoles;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch role from profile
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              setRole(data.role);
            }
            setLoading(false);
          });
      } else {
        setRole('public');
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setRole(data.role);
        }
      } else {
        setRole('public');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    role,
    updateProfile,
    hasRole,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
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
  requiredRoles?: UserRole | UserRole[];
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