import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface RenewalSuccessState {
  renewalId: string;
  applicationNumber: string;
  title: string;
  amount: number;
}

export default function RenewalSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as RenewalSuccessState;

  if (!state) {
    navigate('/renewals');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-2xl font-medium text-gray-900">
              Renewal Successful
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your renewal payment has been processed successfully.
            </p>
          </div>

          <div className="mt-6">
            <dl className="divide-y divide-gray-200">
              <div className="py-4">
                <dt className="text-sm font-medium text-gray-500">
                  Reference Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {state.renewalId}
                </dd>
              </div>

              <div className="py-4">
                <dt className="text-sm font-medium text-gray-500">
                  Application
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {state.title}
                </dd>
              </div>

              <div className="py-4">
                <dt className="text-sm font-medium text-gray-500">
                  Application Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {state.applicationNumber}
                </dd>
              </div>

              <div className="py-4">
                <dt className="text-sm font-medium text-gray-500">
                  Amount Paid
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  £{state.amount}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-600 text-center">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/renewals')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Renewals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 