import { env } from '../config/env';

const API_URL = `${env.VITE_SUPABASE_URL}/rest/v1`;

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'apikey': env.VITE_SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}