import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

interface FilterState {
  type: string[];
  status: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  jurisdiction: string[];
}

interface FilterPreset {
  id: string;
  name: string;
  filters: FilterState;
}

interface FilterPanelProps {
  filters: FilterState;
  onUpdateFilter: (key: keyof FilterState, value: any) => void;
  onClearFilters: () => void;
  onSavePreset: (name: string) => void;
  onLoadPreset: (preset: FilterPreset) => void;
  filterPresets: FilterPreset[];
}

export default function FilterPanel({
  filters,
  onUpdateFilter,
  onClearFilters,
  onSavePreset,
  onLoadPreset,
  filterPresets,
}: FilterPanelProps) {
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName);
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSavePreset(!showSavePreset)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Preset
          </button>
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <X className="w-4 h-4 mr-1.5" />
            Clear All
          </button>
        </div>
      </div>

      {/* Save Preset Form */}
      {showSavePreset && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Enter preset name"
            className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <button
            onClick={handleSavePreset}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      )}

      {/* Filter Presets */}
      {filterPresets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Saved Presets</h4>
          <div className="flex flex-wrap gap-2">
            {filterPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onLoadPreset(preset)}
                className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm hover:bg-indigo-100"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Type Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            multiple
            value={filters.type}
            onChange={(e) =>
              onUpdateFilter(
                'type',
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="trademark">Trademark</option>
            <option value="patent">Patent</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            multiple
            value={filters.status}
            onChange={(e) =>
              onUpdateFilter(
                'status',
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="pending">Pending</option>
            <option value="registered">Registered</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Date Range</label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.start || ''}
              onChange={(e) =>
                onUpdateFilter('dateRange', {
                  ...filters.dateRange,
                  start: e.target.value,
                })
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              placeholder="Start date"
            />
            <input
              type="date"
              value={filters.dateRange.end || ''}
              onChange={(e) =>
                onUpdateFilter('dateRange', {
                  ...filters.dateRange,
                  end: e.target.value,
                })
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              placeholder="End date"
            />
          </div>
        </div>

        {/* Jurisdiction Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Jurisdiction</label>
          <select
            multiple
            value={filters.jurisdiction}
            onChange={(e) =>
              onUpdateFilter(
                'jurisdiction',
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="US">United States</option>
            <option value="EU">European Union</option>
            <option value="UK">United Kingdom</option>
            <option value="CN">China</option>
            <option value="JP">Japan</option>
            <option value="KR">South Korea</option>
            <option value="AU">Australia</option>
          </select>
        </div>
      </div>
    </div>
  );
} 