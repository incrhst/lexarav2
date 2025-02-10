import React from 'react';
import { Notification } from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Archive, ArrowRight } from 'lucide-react';
import { getNotificationIcon, getNotificationColor } from '../../utils/notifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onArchive,
}: NotificationItemProps) {
  const IconComponent = getNotificationIcon(notification.type);
  const colorClasses = getNotificationColor(notification.priority);

  return (
    <div
      className={`p-4 ${
        !notification.isRead ? 'bg-indigo-50' : ''
      } hover:bg-gray-50 transition-colors`}
    >
      <div className="flex items-start space-x-4">
        <div className={`rounded-full p-2 ${colorClasses}`}>
          <IconComponent className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            <div className="flex items-center space-x-2">
              {!notification.isRead && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-indigo-600 hover:text-indigo-500"
                  title="Mark as read"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => onArchive(notification.id)}
                className="text-gray-400 hover:text-gray-500"
                title="Archive"
              >
                <Archive className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mt-1 text-sm text-gray-500">{notification.message}</p>

          {notification.actionUrl && (
            <a
              href={notification.actionUrl}
              className="mt-2 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {notification.actionText || 'View details'}
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          )}

          <p className="mt-2 text-xs text-gray-500">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </div>
  );
} 