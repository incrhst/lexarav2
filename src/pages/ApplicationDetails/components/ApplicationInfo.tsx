import React from 'react';
import { Application } from '../../../types';

interface Props {
  application: Application;
}

export default function ApplicationInfo({ application }: Props) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Application Details</h2>
      </div>
      
      <div className="px-6 py-4 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Applicant Information</h3>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{application.applicant_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Country</dt>
              <dd className="mt-1 text-sm text-gray-900">{application.applicant_country}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{application.applicant_address}</dd>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Trademark Details</h3>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{application.trademark_description}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Use Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{application.use_status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Classes</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {application.goods_services_class?.join(', ')}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}