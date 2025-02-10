import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, LogOut, User, Search, LayoutDashboard, Scale, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Logo from '../Logo';
import Button from '../Button';
import NotificationBell from '../NotificationBell';

export default function AgentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/agent/login');
  };

  const navigation = [
    { name: 'Dashboard', to: '/agent', icon: LayoutDashboard, end: true },
    { name: 'Applications', to: '/agent/applications', icon: FileText },
    { name: 'Gazette Browser', to: '/agent/gazette', icon: Search },
    { name: 'Oppositions', to: '/agent/oppositions', icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-background-alt shadow-lg flex-shrink-0">
        <div className="h-16 flex items-center px-4 border-b border-primary/10">
          <Logo />
        </div>
        
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
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
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-background-alt shadow-sm flex items-center justify-end px-8 gap-4">
          <NotificationBell />
          
          <Link
            to="/agent/profile"
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
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 