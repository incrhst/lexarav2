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

async function getOrCreateProfile(user: User): Promise<{ role: UserRole }> {
  // First try to get the profile
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile) {
    return { role: profile.role };
  }

  // If no profile exists, create one
  if (fetchError?.code === 'PGRST116') { // No rows returned
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          email: user.email,
          role: 'applicant', // Default role
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select('role')
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      throw createError;
    }

    return { role: newProfile.role };
  }

  // If there was a different error
  if (fetchError) {
    console.error('Error fetching profile:', fetchError);
    throw fetchError;
  }

  return { role: 'public' };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('AuthProvider rendered');
  
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    role: 'public',
    loading: true
  });

  console.log('Current auth state:', state);

  useEffect(() => {
    console.log('Auth effect running');
    let isSubscribed = true;
    
    async function initializeAuth() {
      console.log('Initializing auth...');
      try {
        const { data: { session }, error: sessionError } = await auth.getSession();
        console.log('Session result:', { session, error: sessionError });
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (isSubscribed) {
            setState(prev => ({ 
              ...prev, 
              session: null, 
              user: null, 
              role: 'public',
              loading: false 
            }));
          }
          return;
        }
        
        if (session?.user) {
          console.log('Session found, updating state with user');
          if (isSubscribed) {
            setState(prev => ({ ...prev, session, user: session.user }));
          }
          
          try {
            console.log('Fetching or creating profile for user:', session.user.id);
            const { role } = await getOrCreateProfile(session.user);

            if (isSubscribed) {
              setState(prev => ({ 
                ...prev, 
                role,
                loading: false 
              }));
            }
            console.log('Auth initialization complete with role:', role);
          } catch (error) {
            console.error('Error handling profile:', error);
            if (isSubscribed) {
              setState(prev => ({ 
                ...prev, 
                role: 'public',
                loading: false 
              }));
            }
          }
        } else {
          console.log('No session found, setting public state');
          if (isSubscribed) {
            setState(prev => ({ 
              ...prev, 
              session: null, 
              user: null, 
              role: 'public',
              loading: false 
            }));
          }
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        if (isSubscribed) {
          setState(prev => ({ 
            ...prev, 
            session: null, 
            user: null, 
            role: 'public',
            loading: false 
          }));
        }
      }
    }

    initializeAuth();

    console.log('Setting up auth listener');
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', { event, session });
      
      if (!isSubscribed) return;

      setState(prev => {
        console.log('Updating state with new session');
        return { ...prev, session, user: session?.user ?? null };
      });
      
      if (session?.user) {
        try {
          console.log('Fetching or creating profile after auth change for user:', session.user.id);
          const { role } = await getOrCreateProfile(session.user);

          if (isSubscribed) {
            setState(prev => ({ 
              ...prev, 
              role,
              loading: false
            }));
          }
          console.log('Auth state change complete with role:', role);
        } catch (error) {
          console.error('Error handling profile after auth change:', error);
          if (isSubscribed) {
            setState(prev => ({ 
              ...prev, 
              role: 'public',
              loading: false
            }));
          }
        }
      } else {
        console.log('No session in auth change, setting public state');
        if (isSubscribed) {
          setState(prev => ({ 
            ...prev, 
            role: 'public',
            loading: false
          }));
        }
      }
    });

    return () => {
      console.log('Cleaning up auth effect');
      isSubscribed = false;
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