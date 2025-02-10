import React from 'react';
import { FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Application } from '../../hooks/useApplications';

interface ApplicationListProps {
  applications: Application[];
  onView: (id: string) => void;
}

const statusIcons = {
  draft: Clock,
  pending: AlertCircle,
  active: FileText,
  completed: CheckCircle,
  rejected: AlertCircle,
};

const statusColors = {
  draft: 'text-gray-500',
  pending: 'text-yellow-500',
  active: 'text-blue-500',
  completed: 'text-green-500',
  rejected: 'text-red-500',
};

export default function ApplicationList({ applications, onView }: ApplicationListProps) {
  if (!applications.length) {
    return (
      <div className="text-center py-8 text-primary-light">
        No applications found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        const StatusIcon = statusIcons[application.status];
        const statusColor = statusColors[application.status];

        return (
          <div
            key={application.id}
            className="bg-background-alt p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onView(application.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${statusColor} bg-opacity-10`}>
                  <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                </div>
                <div>
                  <h3 className="font-medium text-primary">
                    {application.title}
                  </h3>
                  <p className="text-sm text-primary-light">
                    {application.application_number || 'Draft'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary">
                  {application.type.charAt(0).toUpperCase() + application.type.slice(1)}
                </p>
                <p className="text-sm text-primary-light">
                  {application.filing_date
                    ? new Date(application.filing_date).toLocaleDateString()
                    : 'Not filed'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 