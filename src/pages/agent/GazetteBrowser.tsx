import React, { useState } from 'react';
import { Search, BookmarkPlus, Filter } from 'lucide-react';
import Button from '../../components/Button';

export default function GazetteBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  // TODO: Implement actual gazette search functionality
  const searchResults = [];
  const loading = false;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-primary">Gazette Browser</h1>
        <p className="text-primary-light mt-1">
          Search and monitor IP publications
        </p>
      </header>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-light h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gazette entries..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-primary/10 rounded-lg text-primary"
            />
          </div>
          <Button variant="secondary" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background-alt rounded-lg">
          <div>
            <label className="block text-sm font-medium text-primary-light mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-background border border-primary/10 rounded-md px-3 py-1.5 text-primary"
            >
              <option value="all">All Types</option>
              <option value="trademark">Trademarks</option>
              <option value="patent">Patents</option>
              <option value="design">Designs</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-light mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full bg-background border border-primary/10 rounded-md px-3 py-1.5 text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-light mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full bg-background border border-primary/10 rounded-md px-3 py-1.5 text-primary"
            />
          </div>
        </div>
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="text-center py-8 text-primary-light">
          Searching gazette...
        </div>
      ) : !searchResults.length ? (
        <div className="text-center py-8 text-primary-light">
          {searchQuery
            ? 'No results found'
            : 'Enter a search query to find gazette entries'}
        </div>
      ) : (
        <div className="space-y-4">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="p-4 bg-background-alt rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-primary">{result.title}</h3>
                  <p className="text-sm text-primary-light mt-1">
                    {result.type} | Published: {result.date}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {/* TODO: Implement save functionality */}}
                >
                  <BookmarkPlus className="h-4 w-4" />
                  Save
                </Button>
              </div>
              <p className="mt-2 text-sm text-primary line-clamp-2">
                {result.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 