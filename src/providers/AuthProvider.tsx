import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { auth, supabase } from '../lib/supabase';
import { Navigate, useLocation } from 'react-router-dom';

type UserRole = 'admin' | 'processor' | 'user' | 'agent' | 'public' | 'applicant';

interface AuthState {
  session: Session | null;
  user: User | null;
  role: UserRole;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (requiredRoles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    role: 'public',
    loading: true
  });

  useEffect(() => {
    async function initializeAuth() {
      try {
        // Get initial session
        const { data: { session } } = await auth.getSession();
        
        if (session) {
          setState(prev => ({ ...prev, session, user: session.user }));
          
          try {
            // Fetch role from profile
            const { data, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            setState(prev => ({ 
              ...prev, 
              role: (data?.role as UserRole) ?? 'public',
              loading: false 
            }));
          } catch (error) {
            console.error('Error fetching user role:', error);
            setState(prev => ({ 
              ...prev, 
              role: 'public',
              loading: false 
            }));
          }
        } else {
          setState(prev => ({ 
            ...prev, 
            session: null, 
            user: null, 
            role: 'public',
            loading: false 
          }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState(prev => ({ 
          ...prev, 
          session: null, 
          user: null, 
          role: 'public',
          loading: false 
        }));
      }
    }

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
      
      if (session?.user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          setState(prev => ({ 
            ...prev, 
            role: (data?.role as UserRole) ?? 'public',
            loading: false
          }));
        } catch (error) {
          console.error('Error fetching user role:', error);
          setState(prev => ({ 
            ...prev, 
            role: 'public',
            loading: false
          }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          role: 'public',
          loading: false
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await auth.signIn(email, password);
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await auth.signUp(email, password);
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await auth.signOut();
    if (error) throw error;
  };

  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(state.role);
    }
    return state.role === requiredRoles;
  };

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    hasRole
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRoles?: UserRole | UserRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth();
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
  const { user, hasRole } = useAuth();
  return { user, isAdmin: hasRole('admin') };
}

export function useAgentAuth() {
  const { user, hasRole } = useAuth();
  return { user, isAgent: hasRole('agent') };
}

export function useApplicantAuth() {
  const { user, hasRole } = useAuth();
  return { user, isApplicant: hasRole('applicant') };
} 