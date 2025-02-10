import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';
import LoginForm from '../components/LoginForm';
import DemoLoginOptions from '../components/DemoLoginOptions';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ({ email, password }: { email: string; password: string }) => {
    setError('');
    setLoading(true);

    try {
      console.log('Attempting to sign in with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      if (!data.user) {
        console.error('No user data returned');
        throw new Error('No user data returned from authentication');
      }

      console.log('Login successful for user:', data.user.email);

      // Check for opposition redirect
      const oppositionRedirect = sessionStorage.getItem('oppositionRedirect');
      if (oppositionRedirect) {
        sessionStorage.removeItem('oppositionRedirect');
        navigate(oppositionRedirect);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error details:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Logo />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
            Sign in to Lexara IP
          </h2>
        </div>

        <LoginForm
          onSubmit={handleSubmit}
          error={error}
          isLoading={loading}
        />

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-primary-light">Demo Accounts</span>
            </div>
          </div>

          <DemoLoginOptions />
        </div>

        <div className="text-sm text-center">
          <Link
            to="/register"
            className="font-medium text-primary-light hover:text-primary"
          >
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}