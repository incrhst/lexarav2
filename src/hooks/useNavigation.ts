import { 
  Home,
  FileText,
  ClipboardList,
  Settings,
  LogOut,
  LogIn,
  Calendar,
  Scale,
  Banknote,
  Users,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

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

export function useNavigation(role: string | null, loading: boolean): NavigationItem[] {
  const { signOut } = useAuth();

  if (loading) {
    return [];
  }

  // If no role or invalid role, show public navigation
  const validRoles = ['admin', 'processor', 'user', 'agent', 'public', 'applicant'];
  if (!role || !validRoles.includes(role)) {
    return [
      { name: 'Home', to: '/', icon: Home, end: true },
      { divider: true },
      { name: 'Sign In', to: '/login', icon: LogIn, end: true }
    ];
  }

  const baseNavigation: NavigationItem[] = [
    { name: 'Home', to: '/', icon: Home, end: true },
  ];

  const applicantNavigation: NavigationItem[] = [
    ...baseNavigation,
    { divider: true },
    { name: 'My Applications', to: '/applications', icon: FileText },
    { name: 'New Application', to: '/applications/new', icon: ClipboardList },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const adminNavigation: NavigationItem[] = [
    ...baseNavigation,
    { divider: true },
    { name: 'Renewal Management', to: '/admin/renewals', icon: Calendar },
    { name: 'Opposition Management', to: '/admin/oppositions', icon: Scale },
    { name: 'Payment Verification', to: '/admin/payments', icon: Banknote },
    { name: 'Applications', to: '/admin/applications', icon: FileText },
    { name: 'Users', to: '/admin/users', icon: Users },
    { name: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  const processorNavigation: NavigationItem[] = [
    ...baseNavigation,
    { divider: true },
    { name: 'Applications', to: '/processor/applications', icon: FileText },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const agentNavigation: NavigationItem[] = [
    ...baseNavigation,
    { divider: true },
    { name: 'My Clients', to: '/agent/clients', icon: Users },
    { name: 'Applications', to: '/agent/applications', icon: FileText },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  let navigation: NavigationItem[] = [];

  switch (role) {
    case 'admin':
      navigation = adminNavigation;
      break;
    case 'applicant':
      navigation = applicantNavigation;
      break;
    case 'processor':
      navigation = processorNavigation;
      break;
    case 'agent':
      navigation = agentNavigation;
      break;
    default:
      navigation = baseNavigation;
  }

  // Add sign out button if not public
  if (role !== 'public') {
    navigation.push({ divider: true });
    navigation.push({
      name: 'Sign Out',
      to: '/login',
      icon: LogOut,
      end: true,
      action: signOut
    });
  }

  return navigation;
}