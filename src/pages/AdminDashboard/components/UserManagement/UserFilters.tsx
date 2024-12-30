import React from 'react';
import { UserFilterOptions } from '../../types';
import { Search } from 'lucide-react';

interface Props {
  filters: UserFilterOptions;
  onFilterChange: (filters: UserFilterOptions) => void;
}

export default function UserFilters({ filters, onFilterChange }: Props) {
  const handleChange = (key: keyof UserFilterOptions, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-background-alt shadow rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-primary/40" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search users..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <select
            value={filters.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="processor">Processor</option>
            <option value="applicant">Applicant</option>
            <option value="public">Public</option>
          </select>
        </div>

        <div>
          <select
            value={filters.dateRange}
            onChange={(e) => handleChange('dateRange', e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>
    </div>
  );
}