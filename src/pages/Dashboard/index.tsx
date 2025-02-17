import React from 'react';
import { useAuth } from '../../providers/AuthProvider';
import ApplicationList from './components/ApplicationList';
import DashboardStats from './components/DashboardStats';
import RecentActivity from './components/RecentActivity';
import PublicDashboard from './components/PublicDashboard';

export default function Dashboard() {
  const { role, loading } = useAuth();

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (role === 'public') {
    return <PublicDashboard />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-primary-light">
          Manage your intellectual property applications
        </p>
      </header>

      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ApplicationList />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}