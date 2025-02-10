import React from 'react';
import { FileText, Scale, Clock, Bell } from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';
import { useOppositions } from '../../hooks/useOppositions';
import { useDeadlines } from '../../hooks/useDeadlines';
import { useNotifications } from '../../hooks/useNotifications';

export default function DashboardStats() {
  const { applications } = useApplications();
  const { oppositions } = useOppositions();
  const { deadlines } = useDeadlines();
  const { unreadCount } = useNotifications();

  const stats = [
    {
      name: 'Active Applications',
      value: applications?.filter(app => app.status === 'active').length || 0,
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      name: 'Pending Oppositions',
      value: oppositions?.filter(opp => opp.status === 'pending').length || 0,
      icon: Scale,
      color: 'text-yellow-500'
    },
    {
      name: 'Upcoming Deadlines',
      value: deadlines?.filter(d => !d.completed).length || 0,
      icon: Clock,
      color: 'text-red-500'
    },
    {
      name: 'Recent Updates',
      value: unreadCount || 0,
      icon: Bell,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-background-alt p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${stat.color} bg-opacity-10`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-primary-light">
                {stat.name}
              </p>
              <p className="text-2xl font-semibold text-primary">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 