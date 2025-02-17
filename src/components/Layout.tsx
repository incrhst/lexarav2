import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LogOut, LogIn, LucideIcon } from 'lucide-react';
import { useAuthContext } from '../providers/AuthProvider';
import { useNavigation } from '../hooks/useNavigation';
import Header from './Header';
import Logo from './Logo';

type NavigationLink = {
  name: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
  action?: () => void;
};

type NavigationDivider = {
  divider: boolean;
};

type NavigationItem = NavigationLink | NavigationDivider;

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, loading } = useAuthContext();
  const navigation = useNavigation(role, loading);

  console.log('Layout render:', { user, role, loading, navigationItems: navigation });

  const handleNavigation = async (item: NavigationLink) => {
    console.log('Navigation item clicked:', item);
    if (item.action) {
      try {
        await item.action();
      } catch (error) {
        console.error('Error executing navigation action:', error);
      }
    } else {
      navigate(item.to);
    }
  };

  // If no user and not on login page, redirect to login
  if (!user && !loading && location.pathname !== '/login') {
    console.log('No user detected, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If we're on the login page and have a user, redirect to home
  if (user && !loading && location.pathname === '/login') {
    console.log('User detected on login page, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Don't render layout on login page
  if (location.pathname === '/login') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16 min-h-screen flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-background-alt shadow-lg flex-shrink-0">
          <div className="h-16 flex items-center px-4 border-b border-primary/10">
            <Logo />
          </div>
          
          <nav className="p-4 space-y-1">
            {loading ? (
              <div className="text-sm text-gray-500">Loading navigation...</div>
            ) : navigation && navigation.length > 0 ? (
              navigation.map((item, index) => {
                console.log('Rendering navigation item:', item);
                return 'divider' in item ? (
                  <div key={`divider-${index}`} className="h-px bg-primary/10 my-2" />
                ) : (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                      (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to))
                        ? 'bg-primary text-background'
                        : 'text-primary hover:bg-primary/10'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                );
              })
            ) : (
              <div className="text-sm text-gray-500">No navigation items available</div>
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}