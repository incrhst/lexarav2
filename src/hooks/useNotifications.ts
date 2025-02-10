import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { NotificationService, Notification } from '../services/notificationService';

interface UseNotificationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  limit?: number;
}

export function useNotifications({
  autoRefresh = false,
  refreshInterval = 30000,
  limit = 10
}: UseNotificationsOptions = {}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [notificationsData, count] = await Promise.all([
        NotificationService.getUserNotifications(user.id, {
          limit,
          offset,
          includeRead: true,
          includeArchived: false
        }),
        NotificationService.getUnreadCount(user.id)
      ]);

      setNotifications(prev => 
        offset === 0 ? notificationsData : [...prev, ...notificationsData]
      );
      setUnreadCount(count);
      setHasMore(notificationsData.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
    } finally {
      setLoading(false);
    }
  }, [user, limit, offset]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setOffset(prev => prev + limit);
    }
  }, [loading, hasMore, limit]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      await NotificationService.markAsRead(notificationId, user.id);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark notification as read'));
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await NotificationService.markAllAsRead(user.id);
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark all notifications as read'));
    }
  }, [user]);

  const archiveNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      await NotificationService.archiveNotification(notificationId, user.id);
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to archive notification'));
    }
  }, [user, notifications]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !user) return;

    const intervalId = setInterval(fetchNotifications, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, user, fetchNotifications]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const subscription = NotificationService.subscribeToNotifications(user.id, {
      onNotification: fetchNotifications,
      onError: (err) => setError(err)
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    refresh: fetchNotifications
  };
} 