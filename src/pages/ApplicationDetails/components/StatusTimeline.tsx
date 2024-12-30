import React from 'react';
import { Application } from '../../../types';

interface Props {
  application: Application;
}

export default function StatusTimeline({ application }: Props) {
  const statusHistory = application.application_status_history || [];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Status History</h2>
      </div>
      
      <div className="px-6 py-4">
        <div className="flow-root">
          <ul className="-mb-8">
            {statusHistory.map((status, idx) => (
              <li key={status.id}>
                <div className="relative pb-8">
                  {idx !== statusHistory.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-indigo-600" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <p className="text-sm text-gray-500">
                          Status changed to{' '}
                          <span className="font-medium text-gray-900">
                            {status.status}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {new Date(status.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {status.notes && (
                        <p className="mt-2 text-sm text-gray-500">{status.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}