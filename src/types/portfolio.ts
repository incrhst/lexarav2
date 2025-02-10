export interface Application {
  id: string;
  title: string;
  type: 'trademark' | 'patent';
  status: string;
  reference_number: string;
  filing_date: string;
  jurisdiction: string;
  owner_name: string;
  last_updated: string;
  next_deadline?: string;
  classes?: string[];
}

export interface FilterState {
  type: string[];
  status: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  jurisdiction: string[];
}

export interface SortConfig {
  field: keyof Application;
  direction: 'asc' | 'desc';
}

export interface SavedFilter {
  name: string;
  filters: FilterState;
} 