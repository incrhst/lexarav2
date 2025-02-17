import React from 'react';
import { Link } from 'react-router-dom';
import { Search, LogOut, User, LogIn } from 'lucide-react';
import { useAuthContext } from '../providers/AuthProvider';
import UserRoleIndicator from './UserRoleIndicator';
import Button from './Button';
import Logo from './Logo';

export default function Header() {
  const { user, role, signOut } = useAuthContext();

  console.log('Header rendering with:', { user, role });

  const handleLogout = async () => {
    try {
      console.log('Header: Starting logout');
      await signOut();
      console.log('Header: Logout successful');
    } catch (error) {
      console.error('Header: Error signing out:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8" style={{ backgroundColor: '#EDEBE6' }}>
      <div className="flex items-center">
        <Logo className="h-8 w-auto" />
      </div>
      
      <div className="flex items-center gap-4">
        {user && role && role !== 'public' && (
          <UserRoleIndicator role={role} />
        )}
        
        <button
          type="button"
          className="p-2 rounded-full text-primary hover:text-primary-light"
        >
          <Search className="h-6 w-6" />
        </button>

        {user ? (
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
  );
} 