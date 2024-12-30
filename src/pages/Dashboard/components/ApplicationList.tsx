import React from 'react';
import { Link } from 'react-router-dom';
import { useApplications } from '../../../hooks/useApplications';
import { formatDate } from '../../../utils/date';
import ApplicationStatusBadge from '../../../components/ApplicationStatusBadge';
import Button from '../../../components/Button';

export default function ApplicationList() {
  const { applications, loading, error } = useApplications();

  if (error) {
    return <div className="text-red-600">Error loading applications. Please try again later.</div>;
  }

  if (loading) {
    return <div className="animate-pulse">Loading applications...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Your Applications</h2>
        <Link to="/applications/new">
          <Button>New Application</Button>
        </Link>
      </div>
      
      <div className="border-t border-gray-200 divide-y divide-gray-200">
        {applications?.length === 0 ? (
          <p className="p-4 text-center text-gray-500">
            No applications found. Start by creating a new application.
          </p>
        ) : (
          applications?.map((app) => (
            <Link
              key={app.id}
              to={`/applications/${app.id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {app.trademark_name || app.filing_number}
                    </p>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(app.filing_date)}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-500">
                    {app.application_type} • {app.applicant_name}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}