import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, LogOut, User, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUserRole } from '../hooks/useUserRole';
import { useNavigation } from '../hooks/useNavigation';
import UserRoleIndicator from './UserRoleIndicator';
import Button from './Button';
import Logo from './Logo';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, loading } = useUserRole();
  const navigation = useNavigation(role, loading);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Don't render anything during initial load to prevent flashing
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-background-alt shadow-lg flex-shrink-0">
        <div className="h-16 flex items-center px-4 border-b border-primary/10">
          <Logo />
        </div>
        
        <nav className="p-4 space-y-1">
          {navigation.map((item, index) => 
            item.divider ? (
              <div key={`divider-${index}`} className="h-px bg-primary/10 my-2" />
            ) : (
              <Link
                key={item.name}
                to={item.to}
                className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                  (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to))
                    ? 'bg-primary text-background'
                    : 'text-primary hover:bg-primary/10'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-background-alt shadow-sm flex items-center justify-end px-8 gap-4">
          {role !== 'public' && <UserRoleIndicator role={role} />}
          
          <button
            type="button"
            className="p-2 rounded-full text-primary hover:text-primary-light"
          >
            <Search className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4">
            {role !== 'public' ? (
              <>
                <Link
                  to="/profile"
                  className="p-2 rounded-full text-primary hover:text-primary-light"
                >
                  <User className="h-6 w-6" />
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="sm" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}