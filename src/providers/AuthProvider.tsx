import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Navigate, useLocation } from 'react-router-dom';

type UserRole = 'admin' | 'processor' | 'user' | 'agent' | 'public' | 'applicant';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error?: Error;
  role: UserRole | null;
  updateProfile: (profileData: any) => Promise<void>;
  hasRole: (requiredRoles: UserRole | UserRole[]) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [role, setRole] = useState<UserRole | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const updateProfile = async (profileData: any) => {
    const { data, error } = await supabase.auth.updateUser({ data: profileData });
    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    console.log('Starting sign out process...');
    try {
      // Clear all storage first
      console.log('Clearing storage...');
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();

      // Clear local state
      console.log('Clearing local state...');
      setUser(null);
      setRole('public');
      setShouldRedirect(true);
      setLoading(false);

      // Sign out from Supabase
      console.log('Signing out from Supabase...');
      await supabase.auth.signOut();

      // Force a complete reload and redirect
      console.log('Forcing complete page reload...');
      window.location.href = '/login';
      window.location.reload();
    } catch (error) {
      console.error('Error in signOut function:', error);
      // Even if there's an error, try to clean up everything
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      window.location.href = '/login';
      window.location.reload();
    }
  };

  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(role);
    } else {
      return role === requiredRoles;
    }
  };

  async function ensureProfile(userId: string, email: string) {
    try {
      console.log('Starting ensureProfile for user:', { userId, email });
      
      // First, try to get the existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, role, full_name')
        .eq('id', userId)
        .single();

      console.log('Profile fetch attempt:', { existingProfile, fetchError });

      if (fetchError) {
        console.log('Profile fetch error:', fetchError.code, fetchError.message);
        // Create profile for any fetch error, not just PGRST116
        console.log('Creating new profile');
        const defaultRole = 'applicant' as UserRole;
        const profileData = {
          id: userId,
          email,
          full_name: email.split('@')[0],
          role: defaultRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('Attempting to create profile with data:', profileData);
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert([profileData], { onConflict: 'id' })
          .select()
          .single();

        if (insertError) {
          console.error('Profile creation error:', insertError);
          // Instead of throwing, return a default profile
          console.log('Returning default profile due to creation error');
          return profileData;
        }

        console.log('Successfully created new profile:', newProfile);
        return newProfile || profileData;
      }

      if (!existingProfile) {
        console.log('No profile found but no error - creating default profile');
        const defaultProfile = {
          id: userId,
          email,
          full_name: email.split('@')[0],
          role: 'applicant' as UserRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return defaultProfile;
      }

      console.log('Found existing profile:', existingProfile);
      return existingProfile;
    } catch (error) {
      console.error('Error in ensureProfile:', error);
      // Instead of throwing, return a default profile
      const defaultProfile = {
        id: userId,
        email,
        full_name: email.split('@')[0],
        role: 'applicant' as UserRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log('Returning default profile due to error');
      return defaultProfile;
    }
  }

  async function fetchUserRole(userId: string, email: string) {
    if (!userId) {
      console.log('No userId provided to fetchUserRole');
      setRole('public');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Starting fetchUserRole for user:', { userId, email });
      
      // First ensure profile exists
      const profile = await ensureProfile(userId, email);
      console.log('Profile after ensure:', profile);

      if (profile && profile.role) {
        // Validate that the role is one of our UserRole types
        const validRoles: UserRole[] = ['admin', 'processor', 'user', 'agent', 'public', 'applicant'];
        const newRole = validRoles.includes(profile.role as UserRole) 
          ? profile.role as UserRole 
          : 'applicant';
        
        console.log('Setting user role from profile:', newRole);
        setRole(newRole);
        setLoading(false);
        return newRole;
      } else {
        console.log('No valid role found in profile, setting to applicant');
        // Don't try to update the profile if we couldn't read it
        setRole('applicant');
        setLoading(false);
        return 'applicant';
      }
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      console.log('Setting role to applicant due to error');
      setRole('applicant');
      setLoading(false);
      return 'applicant';
    }
  }

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    async function initializeAuth() {
      try {
        console.log('Starting auth initialization...');
        setLoading(true);

        // Get the initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setUser(null);
          setRole('public');
          setLoading(false);
          return;
        }

        console.log('Initial session check:', session ? 'Session exists' : 'No session', session);
        
        if (session?.user) {
          console.log('Setting user from session:', session.user);
          setUser(session.user);
          
          // Set a timeout only for profile/role fetching
          const profileTimeout = setTimeout(() => {
            if (mounted) {
              console.log('Profile fetch timed out, setting default role');
              setRole('applicant');
              setLoading(false);
            }
          }, 3000);

          try {
            await fetchUserRole(session.user.id, session.user.email || '');
            clearTimeout(profileTimeout);
          } catch (error) {
            console.error('Error fetching user role:', error);
            setRole('applicant');
            setLoading(false);
          }
        } else {
          console.log('No session found, clearing state');
          setUser(null);
          setRole('public');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setUser(null);
          setRole('public');
          setLoading(false);
        }
      }
    }

    // Initialize auth state
    initializeAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
      
      try {
        switch (event) {
          case 'SIGNED_OUT':
            console.log('Auth state: User signed out, clearing state');
            setUser(null);
            setRole('public');
            setShouldRedirect(true);
            setLoading(false);
            if (window.location.pathname !== '/login') {
              window.location.replace('/login');
            }
            break;
            
          case 'SIGNED_IN':
            if (session) {
              console.log('User signed in:', session.user);
              setUser(session.user);
              setShouldRedirect(false);
              
              // Set a timeout for profile/role fetching
              const profileTimeout = setTimeout(() => {
                if (mounted) {
                  console.log('Profile fetch timed out on sign in, setting default role');
                  setRole('applicant');
                  setLoading(false);
                }
              }, 3000);

              try {
                await fetchUserRole(session.user.id, session.user.email || '');
                clearTimeout(profileTimeout);
              } catch (error) {
                console.error('Error fetching user role on sign in:', error);
                setRole('applicant');
                setLoading(false);
              }
            }
            break;
            
          default:
            if (session?.user) {
              console.log('Session exists:', session.user);
              setUser(session.user);
              setShouldRedirect(false);
              
              const profileTimeout = setTimeout(() => {
                if (mounted) {
                  console.log('Profile fetch timed out in default case, setting default role');
                  setRole('applicant');
                  setLoading(false);
                }
              }, 3000);

              try {
                await fetchUserRole(session.user.id, session.user.email || '');
                clearTimeout(profileTimeout);
              } catch (error) {
                console.error('Error fetching user role in default case:', error);
                setRole('applicant');
                setLoading(false);
              }
            } else {
              console.log('No session, clearing state');
              setUser(null);
              setRole('public');
              setLoading(false);
            }
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        setUser(null);
        setRole('public');
        setLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up auth effect');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show loading state only during initial load
  if (loading) {
    console.log('Showing loading state:', { user, role, loading });
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">
          <div>Loading authentication...</div>
          <div className="text-sm text-gray-500 mt-2">
            {user ? 'Fetching user profile...' : 'Checking session...'}
          </div>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    console.log('Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('AuthProvider current state:', { user, role, loading });

  const value = {
    user,
    loading,
    error,
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