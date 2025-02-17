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
import { useAuthContext } from '../providers/AuthProvider';

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
  const { user, signOut } = useAuthContext();

  console.log('useNavigation called with:', { role, loading, user });

  if (loading) {
    console.log('Navigation loading, returning empty array');
    return [];
  }

  // If no user, only show public navigation
  if (!user) {
    console.log('No user, returning public navigation');
    return [
      { name: 'Home', to: '/', icon: Home, end: true },
      { divider: true },
      { name: 'Sign In', to: '/login', icon: LogIn, end: true }
    ];
  }

  // Ensure we have a valid role
  const validRoles = ['admin', 'processor', 'user', 'agent', 'public', 'applicant'];
  const currentRole = validRoles.includes(role || '') ? role : 'public';

  console.log('Using role for navigation:', currentRole);

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

  const publicNavigation: NavigationItem[] = [
    ...baseNavigation,
    { divider: true },
    { name: 'Sign In', to: '/login', icon: LogIn, end: true }
  ];

  let navigation: NavigationItem[] = [];

  console.log('Selecting navigation for role:', currentRole);

  switch (currentRole) {
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
    case 'public':
    default:
      navigation = publicNavigation;
      break;
  }

  // Add sign out button if user is authenticated
  if (user && currentRole !== 'public') {
    navigation.push({ divider: true });
    navigation.push({
      name: 'Sign Out',
      to: '/login',
      icon: LogOut,
      end: true,
      action: signOut
    });
  }

  console.log('Returning navigation items:', navigation);
  return navigation;
}