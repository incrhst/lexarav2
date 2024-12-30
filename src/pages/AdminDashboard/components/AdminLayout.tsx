import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, ArrowLeft } from 'lucide-react';

const navigation = [
  { name: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Applications', to: '/admin/applications', icon: FileText },
  { name: 'Users', to: '/admin/users', icon: Users },
  { name: 'Settings', to: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="w-64 bg-background-alt shadow-lg flex-shrink-0">
        <Link
          to="/"
          className="flex items-center px-4 py-3 text-sm text-primary hover:bg-primary/10 border-b border-primary/10"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Main Menu
        </Link>
        
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-background'
                    : 'text-primary hover:bg-primary/10'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}