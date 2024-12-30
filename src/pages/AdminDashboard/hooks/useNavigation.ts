import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LayoutList, ArrowLeft, UserCheck } from 'lucide-react';

export function useNavigation(role: 'admin' | 'processor' | 'user' | 'agent' | 'public' | null, loading: boolean) {
  const location = useLocation();
  const isAdminSection = location.pathname.startsWith('/admin');

  return useMemo(() => {
    // During loading, return empty array to prevent flashing
    if (loading) return [];

    const userNavigation = [
      { name: 'Dashboard', to: '/', icon: LayoutDashboard },
      { name: 'Gazette', to: '/gazette', icon: FileText },
    ];

    // Add admin navigation items if user is admin
    if (role === 'admin') {
      const adminNavigation = [
        { name: 'Back to Main Menu', to: '/', icon: ArrowLeft },
        { divider: true },
        { name: 'Admin Overview', to: '/admin', icon: LayoutDashboard, end: true },
        { name: 'Applications', to: '/admin/applications', icon: LayoutList },
        { name: 'Agents', to: '/admin/agents', icon: UserCheck },
        { name: 'Users', to: '/admin/users', icon: Users },
        { name: 'Settings', to: '/admin/settings', icon: Settings },
      ];

      // If we're in the admin section, only show admin navigation
      if (isAdminSection) {
        return adminNavigation;
      }

      // Otherwise, show regular navigation plus admin link
      return [...userNavigation, { divider: true }, { name: 'Admin Dashboard', to: '/admin', icon: LayoutDashboard }];
    }

    return userNavigation;
  }, [role, isAdminSection, loading]);
}