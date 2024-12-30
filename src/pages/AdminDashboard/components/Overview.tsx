import React from 'react';
import { useAdminStats } from '../hooks/useAdminStats';
import StatsCard from './StatsCard';

export default function Overview() {
  const { stats, loading } = useAdminStats();

  if (loading) {
    return <div className="animate-pulse">Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Applications"
          value={stats.totalApplications}
          description="All time"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pendingReview}
          description="Requires attention"
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          description="Last 30 days"
        />
      </div>
    </div>
  );
}