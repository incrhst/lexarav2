import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationContext } from '../contexts/NotificationContext';
import NotificationCenter from './NotificationCenter';
import NotificationBadge from './notifications/NotificationBadge';

export default function NotificationBell() {
  const { unreadCount } = useNotificationContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
      >
        <span className="sr-only">View notifications</span>
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <NotificationBadge
            count={unreadCount}
            priority={unreadCount > 10 ? 'high' : 'medium'}
          />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 sm:w-[32rem] z-50">
            <NotificationCenter onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
} 