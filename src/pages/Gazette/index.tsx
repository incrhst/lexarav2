import React from 'react';
import SearchFilters from './components/SearchFilters';
import ApplicationList from './components/ApplicationList';
import { useGazette } from './hooks/useGazette';

export default function Gazette() {
  const { applications, filters, setFilters, loading } = useGazette();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">IP Gazette</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse and search published intellectual property applications
        </p>
      </header>

      <SearchFilters filters={filters} onFilterChange={setFilters} />
      <ApplicationList applications={applications} loading={loading} />
    </div>
  );
}