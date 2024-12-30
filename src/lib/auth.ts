import { apiRequest } from './api';

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export async function register(data: RegisterData) {
  try {
    await apiRequest('/rpc/register_user', {
      method: 'POST',
      body: {
        p_email: data.email,
        p_password: data.password,
        p_full_name: data.fullName,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already registered')) {
        throw new Error('User already registered');
      }
    }
    throw error;
  }
}