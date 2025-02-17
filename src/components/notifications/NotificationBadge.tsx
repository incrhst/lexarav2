import React from 'react';

type NotificationPriority = 'low' | 'medium' | 'high';

interface NotificationBadgeProps {
  count: number;
  priority?: NotificationPriority;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, priority = 'medium' }) => {
  const priorityColors = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
  };

  return (
    <div className={`absolute -top-1 -right-1 ${priorityColors[priority]} text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1`}>
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default NotificationBadge; 