import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null;
let supabaseAdminInstance: SupabaseClient<Database> | null = null;

// Create Supabase client with default auth settings
export const supabase = (() => {
  if (supabaseInstance) return supabaseInstance;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-my-custom-header': 'my-app-name'
      }
    }
  });

  return supabaseInstance;
})();

// Create service role client for admin operations
export const supabaseAdmin = (() => {
  if (supabaseAdminInstance) return supabaseAdminInstance;

  if (!supabaseServiceKey) return null;

  supabaseAdminInstance = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'x-my-custom-header': 'my-app-name-admin'
      }
    }
  });

  return supabaseAdminInstance;
})();

// Ensure supabase is not null before using it
if (!supabase) {
  throw new Error('Failed to initialize Supabase client');
}

// Add debug logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase Auth State Change:', { event, session });
  
  if (session) {
    const token = session.access_token;
    console.log('JWT Token:', token);
    
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded JWT:', decoded);
    } catch (error) {
      console.error('Error decoding JWT:', error);
    }
  }
});

// Test connection
console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key (first 10 chars):', supabaseKey?.substring(0, 10));

// Export auth instance
export const auth = supabase.auth;

// ------------------- Additional Type Definitions, Utilities, and API Functions -------------------

// Response type definition
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Simple error handling utility
function handleApiError(error: any): string {
  return error?.message || 'Unknown error occurred';
}

// ------------------- Database Table Type Definitions -------------------
export interface Application {
  id: string;
  applicant_id: string;
  status: string;
  // Add additional fields as needed
}

export interface ApplicationFile {
  id: string;
  application_id: string;
  file_url: string;
  // Add additional fields as needed
}

export interface FilingRecord {
  id: string;
  application_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Add additional fields as needed
}

export interface Certificate {
  id: string;
  application_id: string;
  certificate_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Add additional fields as needed
}

export interface Payment {
  id: string;
  application_id: string;
  amount: number;
  payment_method: 'card' | 'bank_transfer' | 'check';
  payment_date: string;
  status: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

// ------------------- API Functions -------------------

// Filing Management
export async function createFilingRecord(record: Partial<FilingRecord>): Promise<ApiResponse<FilingRecord>> {
  const { data, error } = await supabase
    .from('filing_records')
    .insert(record)
    .single();
  if (error) {
    return { error: handleApiError(error) };
  }
  return { data: data as FilingRecord };
}

export async function getFilingRecords(applicationId: string): Promise<ApiResponse<FilingRecord[]>> {
  const { data, error } = await supabase
    .from('filing_records')
    .select('*')
    .eq('application_id', applicationId);
  if (error) {
    return { error: handleApiError(error) };
  }
  return { data: data as FilingRecord[] };
}

// Document Handling
export async function uploadDocument(record: Partial<ApplicationFile>): Promise<ApiResponse<ApplicationFile>> {
  const { data, error } = await supabase
    .from('application_files')
    .insert(record)
    .single();
  if (error) {
    return { error: handleApiError(error) };
  }
  return { data: data as ApplicationFile };
}

export async function getDocuments(applicationId: string): Promise<ApiResponse<ApplicationFile[]>> {
  const { data, error } = await supabase
    .from('application_files')
    .select('*')
    .eq('application_id', applicationId);
  if (error) {
    return { error: handleApiError(error) };
  }
  return { data: data as ApplicationFile[] };
}

// Certificate Processing
export async function createCertificate(record: Partial<Certificate>): Promise<ApiResponse<Certificate>> {
  const { data, error } = await supabase
    .from('certificates')
    .insert(record)
    .single();
  if (error) {
    return { error: handleApiError(error) };
  }
  return { data: data as Certificate };
}

export async function getCertificate(applicationId: string): Promise<ApiResponse<Certificate>> {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('application_id', applicationId)
    .single();
  if (error) {
    return { error: handleApiError(error) };
  }
  return { data: data as Certificate };
}

// Payment Processing
export async function createPayment(record: Partial<Payment>): Promise<ApiResponse<Payment>> {
  const { data, error } = await supabase
    .from('payments')
    .insert(record)
    .single();
  if (error) {
    return { error: handleApiError(error) };
  }
  return { data: data as Payment };
}

export async function getPaymentStatus(paymentId: string): Promise<ApiResponse<Payment>> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();
  if (error) {
    return { error: handleApiError(error) };
  }
  return { data: data as Payment };
}