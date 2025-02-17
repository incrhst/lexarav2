import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
    storage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    }
  }
});

// Test function to verify connection
export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key (first 10 chars):', supabaseKey.substring(0, 10) + '...');
  
  try {
    // Test auth service first
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth service test error:', authError.message);
      return false;
    }
    console.log('✅ Auth service connection successful');

    // Test profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('Profiles table test error:', profilesError.message);
      return false;
    }
    console.log('✅ Profiles table accessible');

    // Test applications table
    const { data: applicationsData, error: applicationsError } = await supabase
      .from('applications')
      .select('*')
      .limit(1);

    if (applicationsError) {
      console.error('Applications table test error:', applicationsError.message);
      return false;
    }
    console.log('✅ Applications table accessible');

    return true;
  } catch (err) {
    console.error('Unexpected error during connection test:', err);
    return false;
  }
}

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