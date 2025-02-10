import React from 'react';
import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface RenewalStatsProps {
  totalRenewals: number;
  upcomingRenewals: number;
  overdueRenewals: number;
  totalRevenue: number;
  recentTrends: {
    percentage: number;
    trend: 'up' | 'down';
    description: string;
  };
}

export default function RenewalStats({
  totalRenewals,
  upcomingRenewals,
  overdueRenewals,
  totalRevenue,
  recentTrends,
}: RenewalStatsProps) {
  const stats = [
    {
      name: 'Total Renewals',
      value: totalRenewals,
      icon: CalendarIcon,
      change: recentTrends.percentage,
      changeType: recentTrends.trend as 'up' | 'down',
      changeDescription: recentTrends.description,
    },
    {
      name: 'Upcoming Renewals',
      value: upcomingRenewals,
      icon: ClockIcon,
    },
    {
      name: 'Overdue Renewals',
      value: overdueRenewals,
      icon: ArrowTrendingUpIcon,
    },
    {
      name: 'Total Revenue',
      value: new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(totalRevenue),
      icon: BanknotesIcon,
    },
  ];

  return (
    <div>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              {item.change && (
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    item.changeType === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.changeType === 'up' ? (
                    <ArrowTrendingUpIcon
                      className="h-5 w-5 flex-shrink-0 self-center text-green-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowTrendingUpIcon
                      className="h-5 w-5 flex-shrink-0 self-center text-red-500 transform rotate-180"
                      aria-hidden="true"
                    />
                  )}
                  <span className="sr-only">
                    {item.changeType === 'up' ? 'Increased' : 'Decreased'} by
                  </span>
                  {item.change}%
                </p>
              )}
              {item.changeDescription && (
                <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      {item.changeDescription}
                      <span className="sr-only"> {item.name} stats</span>
                    </a>
                  </div>
                </div>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
} 