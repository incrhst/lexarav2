export interface Application {
  id: string;
  applicant_id: string;
  agent_id?: string;
  client_id?: string;
  application_type: 'trademark' | 'copyright' | 'patent';
  status: 'submitted' | 'underReview' | 'published' | 'opposed' | 'allowed' | 'registered' | 'rejected';
  filing_number: string;
  filing_date: string;
  applicant_name: string;
  applicant_address: string;
  applicant_country: string;
  contact_phone: string;
  contact_email: string;
  trademark_name?: string;
  trademark_description?: string;
  goods_services_class?: string[];
  logo_url?: string;
  use_status?: 'inUse' | 'intentToUse';
  territory?: string[];
  created_at: string;
  updated_at: string;
  application_status_history?: StatusHistory[];
}

export interface StatusHistory {
  id: string;
  status: Application['status'];
  notes?: string;
  created_at: string;
}

export interface Opposition {
  id: string;
  application_id: string;
  opponent_name: string;
  reason: string;
  status: 'submitted' | 'pending' | 'approved' | 'rejected';
  evidence_urls: string[];
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'processor' | 'user' | 'agent' | 'public';

export interface AgentClient {
  id: string;
  agent_id: string;
  client_name: string;
  company_name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}