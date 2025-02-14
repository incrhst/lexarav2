import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import Logo from '../../components/Logo';
import { useToast } from '../../contexts/ToastContext';

export default function Register() {
  const { showToast } = useToast();
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSuccess = () => {
    setIsRegistered(true);
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
          <div>
            <div className="flex justify-center">
              <Logo />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                We've sent you an email with a confirmation link. Please check your inbox and click the link to activate your account.
              </p>
              <p className="mt-4 text-sm text-gray-600">
                After confirming your email, you can{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  sign in to your account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div>
          <div className="flex justify-center">
            <Logo />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link 
              to="/login" 
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <RegisterForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}