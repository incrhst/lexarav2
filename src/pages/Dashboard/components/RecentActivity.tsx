import React from 'react';

export default function RecentActivity() {
  return (
    <div className="bg-background-alt p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-primary mb-4">Recent Activity</h2>
      <div className="text-primary-light text-center py-8">
        No recent activity to display.
      </div>
    </div>
  );
}