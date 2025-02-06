import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome{user ? `, ${user.email}` : ''}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your intellectual property applications
          </p>
        </div>
        {user && (
          <div className="mt-4 sm:mt-0">
            <Link
              to="/applications/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              New Application
            </Link>
          </div>
        )}
      </div>

      {!user ? (
        <div className="mt-8 text-center">
          <h2 className="text-lg font-medium text-gray-900">
            Get Started
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Please log in or create an account to manage your applications
          </p>
          <div className="mt-6 space-x-4">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Register
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">
            Recent Applications
          </h2>
          <div className="mt-4">
            {/* TODO: Add applications list */}
            <p className="text-sm text-gray-500">
              No applications found. Click "New Application" to get started.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 