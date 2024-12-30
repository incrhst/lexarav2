import React from 'react';
import { useOppositions } from '../hooks/useOppositions';

interface Props {
  applicationId: string;
}

export default function OppositionSection({ applicationId }: Props) {
  const { oppositions, loading } = useOppositions(applicationId);

  if (loading) {
    return <div className="animate-pulse">Loading oppositions...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Oppositions</h2>
      </div>
      
      <div className="px-6 py-4">
        {oppositions.length === 0 ? (
          <p className="text-sm text-gray-500">No oppositions filed yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {oppositions.map((opposition) => (
              <li key={opposition.id} className="py-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {opposition.opponent_name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {opposition.reason}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {opposition.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}