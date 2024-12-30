import React from 'react';
import { useRecentActivity } from '../../../hooks/useRecentActivity';
import { formatDate } from '../../../utils/date';

export default function RecentActivity() {
  const { activities, loading } = useRecentActivity();

  if (loading) {
    return <div className="animate-pulse">Loading activity...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="flow-root">
          <ul className="divide-y divide-gray-200">
            {activities?.length === 0 ? (
              <li className="p-4 text-center text-gray-500">
                No recent activity
              </li>
            ) : (
              activities?.map((activity) => (
                <li key={activity.id} className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}