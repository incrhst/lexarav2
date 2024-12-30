import React from 'react';
import { Link } from 'react-router-dom';
import { Application } from '../../../types';
import ApplicationStatusBadge from '../../../components/ApplicationStatusBadge';
import { formatDate } from '../../../utils/date';
import Pagination from './Pagination';

interface Props {
  applications: Application[];
  loading: boolean;
}

export default function ApplicationList({ applications, loading }: Props) {
  if (loading) {
    return <div className="animate-pulse">Loading applications...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {applications.length === 0 ? (
          <p className="text-center text-gray-500">No applications found.</p>
        ) : (
          <div className="overflow-hidden">
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
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/applications/${application.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {application.trademark_name || application.filing_number}
                      </Link>
                      <div className="text-sm text-gray-500">
                        {application.applicant_name}
                      </div>
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
            <Pagination />
          </div>
        )}
      </div>
    </div>
  );
}