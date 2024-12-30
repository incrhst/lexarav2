import React from 'react';
import { useStats } from '../../../hooks/useStats';

export default function DashboardStats() {
  const { stats, loading, error } = useStats();

  if (error) {
    return (
      <div className="text-red-600">
        Error loading stats. Please try again later.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-background-alt pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg"
          >
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-background h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-background rounded w-3/4"></div>
                <div className="h-4 bg-background rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      name: 'Total Applications',
      value: stats.totalApplications,
      color: 'bg-primary',
    },
    {
      name: 'Under Review',
      value: stats.underReview,
      color: 'bg-primary-light',
    },
    {
      name: 'Published',
      value: stats.published,
      color: 'bg-primary',
    },
    {
      name: 'Registered',
      value: stats.registered,
      color: 'bg-primary-lighter',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => (
        <div
          key={stat.name}
          className="relative bg-background-alt pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
        >
          <dt>
            <div className={`absolute rounded-md p-3 ${stat.color}`}>
              <div className="h-6 w-6 text-background" />
            </div>
            <p className="ml-16 text-sm font-medium text-primary truncate">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
            <p className="text-2xl font-semibold text-primary">{stat.value}</p>
          </dd>
        </div>
      ))}
    </div>
  );
}