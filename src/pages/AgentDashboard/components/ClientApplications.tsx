import React from 'react';
import { Link } from 'react-router-dom';
import { useClientApplications } from '../hooks/useClientApplications';
import ApplicationStatusBadge from '../../../components/ApplicationStatusBadge';
import { formatDate } from '../../../utils/date';

interface Props {
  clientId: string;
}

export default function ClientApplications({ clientId }: Props) {
  const { applications, loading } = useClientApplications(clientId);

  if (loading) {
    return <div className="animate-pulse">Loading applications...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/applications/${application.id}`}
                      className="text-primary hover:text-primary-light"
                    >
                      {application.trademark_name || application.filing_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.application_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ApplicationStatusBadge status={application.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(application.filing_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}