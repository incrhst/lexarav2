import { supabase } from '../lib/supabase';
import { z } from 'zod';

// Notification type schema
export const notificationTypeSchema = z.enum([
  'status_change',
  'payment_confirmation',
  'document_verification',
  'opposition_notice',
  'registration_complete',
  'renewal_reminder',
  'system_update'
]);

// Notification priority schema
export const notificationPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent'
]);

// Notification schema
export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: notificationTypeSchema,
  priority: notificationPrioritySchema,
  title: z.string(),
  message: z.string(),
  actionUrl: z.string().optional(),
  actionText: z.string().optional(),
  isRead: z.boolean(),
  isArchived: z.boolean(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  scheduledFor: z.string().optional()
});

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationPriority = z.infer<typeof notificationPrioritySchema>;

export interface NotificationPreference {
  type: NotificationType;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

// Notification service class
export class NotificationService {
  // Get user's notifications
  static async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      includeRead?: boolean;
      includeArchived?: boolean;
    } = {}
  ): Promise<Notification[]> {
    const {
      limit = 10,
      offset = 0,
      includeRead = false,
      includeArchived = false
    } = options;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (!includeRead) {
      query = query.eq('is_read', false);
    }

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(notification => ({
      id: notification.id,
      userId: notification.user_id,
      type: notification.type,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.action_url,
      actionText: notification.action_text,
      isRead: notification.is_read,
      isArchived: notification.is_archived,
      metadata: notification.metadata,
      createdAt: notification.created_at,
      updatedAt: notification.updated_at,
      scheduledFor: notification.scheduled_for
    }));
  }

  // Create a notification
  static async createNotification(params: {
    userId: string;
    type: NotificationType;
    priority?: NotificationPriority;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    metadata?: Record<string, unknown>;
    scheduledFor?: string;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        priority: params.priority || 'medium',
        title: params.title,
        message: params.message,
        action_url: params.actionUrl,
        action_text: params.actionText,
        metadata: params.metadata || {},
        scheduled_for: params.scheduledFor
      })
      .select('id')
      .single();

    if (error) throw error;

    return data.id;
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  }

  // Archive notification
  static async archiveNotification(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Get user's notification preferences
  static async getNotificationPreferences(userId: string): Promise<NotificationPreference[]> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return data.map(pref => ({
      type: pref.type,
      emailEnabled: pref.email_enabled,
      pushEnabled: pref.push_enabled,
      inAppEnabled: pref.in_app_enabled
    }));
  }

  // Update notification preferences
  static async updateNotificationPreferences(
    userId: string,
    type: NotificationType,
    preferences: {
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      inAppEnabled?: boolean;
    }
  ): Promise<void> {
    const updates: Record<string, boolean> = {};
    if (preferences.emailEnabled !== undefined) {
      updates.email_enabled = preferences.emailEnabled;
    }
    if (preferences.pushEnabled !== undefined) {
      updates.push_enabled = preferences.pushEnabled;
    }
    if (preferences.inAppEnabled !== undefined) {
      updates.in_app_enabled = preferences.inAppEnabled;
    }

    const { error } = await supabase
      .from('notification_preferences')
      .update(updates)
      .eq('user_id', userId)
      .eq('type', type);

    if (error) throw error;
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .eq('is_archived', false);

    if (error) throw error;

    return count || 0;
  }

  static subscribeToNotifications(
    userId: string,
    callbacks: {
      onNotification?: () => void;
      onError?: (error: Error) => void;
    }
  ) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          if (callbacks.onNotification) {
            callbacks.onNotification();
          }
        }
      )
      .subscribe((status, err) => {
        if (status !== 'SUBSCRIBED' && callbacks.onError && err) {
          callbacks.onError(new Error(err.message));
        }
      });
  }
} 