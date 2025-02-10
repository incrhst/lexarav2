import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

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

const initialFilterState: FilterState = {
  type: [],
  status: [],
  dateRange: {
    start: null,
    end: null,
  },
  jurisdiction: [],
};

export function usePortfolioFilters() {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilterState);
  }, []);

  const saveFilterPreset = useCallback((name: string) => {
    const newPreset: FilterPreset = {
      id: uuidv4(),
      name,
      filters: { ...filters },
    };
    setFilterPresets((prev) => [...prev, newPreset]);
  }, [filters]);

  const loadFilterPreset = useCallback((preset: FilterPreset) => {
    setFilters(preset.filters);
  }, []);

  const deleteFilterPreset = useCallback((presetId: string) => {
    setFilterPresets((prev) => prev.filter((preset) => preset.id !== presetId));
  }, []);

  return {
    filters,
    updateFilter,
    clearFilters,
    saveFilterPreset,
    loadFilterPreset,
    deleteFilterPreset,
    filterPresets,
  };
} 
