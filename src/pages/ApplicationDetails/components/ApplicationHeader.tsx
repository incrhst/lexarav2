import React from 'react';
import { Application } from '../../../types';
import ApplicationStatusBadge from '../../../components/ApplicationStatusBadge';

interface Props {
  application: Application;
}

export default function ApplicationHeader({ application }: Props) {
  return (
    <div className="bg-white shadow rounded-lg px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {application.trademark_name || application.filing_number}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Filed on {new Date(application.filing_date).toLocaleDateString()}
          </p>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </div>
    </div>
  );
}