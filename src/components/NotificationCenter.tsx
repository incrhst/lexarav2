import React from 'react';
import { useNotificationContext } from '../contexts/NotificationContext';
import NotificationList from './notifications/NotificationList';
import { Archive, CheckSquare } from 'lucide-react';

interface NotificationCenterProps {
  onClose: () => void;
}

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
  const {
    notifications,
    loading,
    error,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  } = useNotificationContext();

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 text-red-600">
          Error loading notifications: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-h-[80vh] flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => markAllAsRead()}
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Mark all as read"
            >
              <CheckSquare className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Close"
            >
              <Archive className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-grow">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {loading ? 'Loading notifications...' : 'No notifications'}
          </div>
        ) : (
          <NotificationList
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onArchive={archiveNotification}
          />
        )}

        {hasMore && (
          <div className="p-4 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 