import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../providers/AuthProvider';
import { useNavigation } from '../hooks/useNavigation';

const Navigation = () => {
  const { user, loading } = useAuthContext();
  const navigationItems = useNavigation(user?.role || 'public', loading);

  return (
    <nav className="fixed left-0 top-0 h-screen w-[250px] bg-background-alt shadow-md p-4">
      <div className="mb-6 border-b border-primary/10 pb-4">
        <h2 className="text-2xl font-semibold text-primary">Lexara</h2>
      </div>
      <ul className="space-y-2">
        {navigationItems.map((item) => {
          if (item.divider) {
            return <li key={`divider-${item.name}`} className="border-t border-primary/10 my-4" />;
          }
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className="flex items-center px-4 py-2 text-primary hover:bg-background rounded-md transition-colors"
              >
                {item.icon && (
                  <span className="mr-3 text-primary">
                    {React.createElement(item.icon, { size: 20 })}
                  </span>
                )}
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation; 