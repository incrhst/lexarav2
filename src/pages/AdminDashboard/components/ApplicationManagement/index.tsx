import React from 'react';
import ApplicationFilters from './ApplicationFilters';
import ApplicationTable from './ApplicationTable';
import { useApplicationManagement } from '../../hooks/useApplicationManagement';

export default function ApplicationManagement() {
  const {
    applications,
    filters,
    setFilters,
    loading,
    updateApplicationStatus,
  } = useApplicationManagement();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage trademark applications
        </p>
      </header>

      <ApplicationFilters filters={filters} onFilterChange={setFilters} />
      
      <ApplicationTable
        applications={applications}
        loading={loading}
        onUpdateStatus={updateApplicationStatus}
      />
    </div>
  );
}