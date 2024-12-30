import React from 'react';
import { Application } from '../../../../types';
import ApplicationStatusBadge from '../../../../components/ApplicationStatusBadge';
import { formatDate } from '../../../../utils/date';
import StatusUpdateModal from './StatusUpdateModal';

interface Props {
  applications: Application[];
  loading: boolean;
  onUpdateStatus: (applicationId: string, status: Application['status'], notes?: string) => Promise<void>;
}

export default function ApplicationTable({ applications, loading, onUpdateStatus }: Props) {
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);

  if (loading) {
    return <div className="animate-pulse">Loading applications...</div>;
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {application.trademark_name || application.filing_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {application.filing_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.applicant_name}</div>
                    <div className="text-sm text-gray-500">{application.contact_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ApplicationStatusBadge status={application.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(application.filing_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StatusUpdateModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onUpdate={onUpdateStatus}
      />
    </>
  );
}