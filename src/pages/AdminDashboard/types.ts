export interface AdminFilters {
  status: string;
  dateRange: string;
  search: string;
}

export interface UserFilterOptions {
  role: string;
  dateRange: string;
  search: string;
}

export interface User {
  id: string;
  role: 'admin' | 'applicant' | 'public';
  full_name: string;
  email: string;
  company_name?: string;
  address?: string;
  country?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}