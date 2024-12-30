import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import Logo from '../../components/Logo';
import { useToast } from '../../contexts/ToastContext';

export default function Register() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSuccess = () => {
    showToast('Account created successfully! You can now sign in.', 'success');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Logo />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-primary-light">
            Or{' '}
            <Link 
              to="/login" 
              className="font-medium text-primary hover:text-primary-light transition-colors"
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