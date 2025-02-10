import { NotificationType, NotificationPriority } from '../services/notificationService';
import {
  Bell,
  RefreshCw,
  CreditCard,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  LucideIcon
} from 'lucide-react';

export const getNotificationIcon = (type: NotificationType): LucideIcon => {
  switch (type) {
    case 'status_change':
      return RefreshCw;
    case 'payment_confirmation':
      return CreditCard;
    case 'document_verification':
      return FileCheck;
    case 'opposition_notice':
      return AlertTriangle;
    case 'registration_complete':
      return CheckCircle;
    case 'renewal_reminder':
      return Clock;
    case 'system_update':
      return Bell;
    default:
      return Bell;
  }
};

export const getNotificationColor = (priority: NotificationPriority): string => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-100';
    case 'high':
      return 'text-orange-600 bg-orange-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'low':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getNotificationDescription = (type: NotificationType): string => {
  switch (type) {
    case 'status_change':
      return 'Application status updates';
    case 'payment_confirmation':
      return 'Payment confirmations';
    case 'document_verification':
      return 'Document verification status';
    case 'opposition_notice':
      return 'Opposition filings and updates';
    case 'registration_complete':
      return 'Registration completions';
    case 'renewal_reminder':
      return 'Renewal deadlines and reminders';
    case 'system_update':
      return 'System updates and maintenance';
    default:
      return 'General notifications';
  }
};

export const getNotificationPriorityLabel = (priority: NotificationPriority): string => {
  switch (priority) {
    case 'urgent':
      return 'Urgent - Immediate action required';
    case 'high':
      return 'High - Action required soon';
    case 'medium':
      return 'Medium - Action may be required';
    case 'low':
      return 'Low - For your information';
    default:
      return 'Normal priority';
  }
}; 