import React from 'react';
import { Notification } from '../../services/notificationService';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
}

export default function NotificationList({
  notifications,
  onMarkAsRead,
  onArchive,
}: NotificationListProps) {
  return (
    <div className="divide-y divide-gray-200">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
} 