import React, { useState } from 'react';
import { LayoutGrid, List, Search, Filter, SlidersHorizontal } from 'lucide-react';
import ApplicationCard from './ApplicationCard';
import ApplicationList from './ApplicationList';
import FilterPanel from './FilterPanel';
import { usePortfolioFilters } from '../../hooks/usePortfolioFilters';

interface Application {
  id: string;
  title: string;
  type: 'trademark' | 'patent';
  status: string;
  reference: string;
  submissionDate: string;
  jurisdiction: string;
  lastUpdated: string;
  nextDeadline?: string;
  description?: string;
  logo?: string;
}

export default function PortfolioView() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<{
    field: keyof Application;
    direction: 'asc' | 'desc';
  }>({ field: 'submissionDate', direction: 'desc' });

  const {
    filters,
    updateFilter,
    clearFilters,
    saveFilterPreset,
    loadFilterPreset,
    filterPresets,
  } = usePortfolioFilters();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (field: keyof Application) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${
              viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${
              viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={handleSearch}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
          <button
            onClick={() => {}}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            Sort
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onUpdateFilter={updateFilter}
          onClearFilters={clearFilters}
          onSavePreset={saveFilterPreset}
          onLoadPreset={loadFilterPreset}
          filterPresets={filterPresets}
        />
      )}

      {/* Sort Options */}
      <div className="flex gap-4 text-sm text-gray-500">
        <span>Sort by:</span>
        {['submissionDate', 'status', 'type', 'jurisdiction'].map((field) => (
          <button
            key={field}
            onClick={() => handleSort(field as keyof Application)}
            className={`${
              sortBy.field === field
                ? 'text-indigo-600 font-medium'
                : 'hover:text-gray-700'
            }`}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
            {sortBy.field === field && (
              <span className="ml-1">
                {sortBy.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Portfolio Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {viewMode === 'grid' ? (
          <ApplicationCard
            application={{
              id: '1',
              title: 'Sample Application',
              type: 'trademark',
              status: 'pending',
              reference: 'TM-2023-001',
              submissionDate: '2023-01-01',
              jurisdiction: 'US',
              lastUpdated: '2023-12-01',
              nextDeadline: '2024-01-01',
              description: 'Sample trademark application',
            }}
          />
        ) : (
          <ApplicationList
            application={{
              id: '1',
              title: 'Sample Application',
              type: 'trademark',
              status: 'pending',
              reference: 'TM-2023-001',
              submissionDate: '2023-01-01',
              jurisdiction: 'US',
              lastUpdated: '2023-12-01',
              nextDeadline: '2024-01-01',
              description: 'Sample trademark application',
            }}
          />
        )}
      </div>
    </div>
  );
}
