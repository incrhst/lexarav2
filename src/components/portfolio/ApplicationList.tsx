import React from 'react';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';

interface Application {
  id: string;
  title: string;
  type: 'trademark' | 'patent';
  status: string;
  reference: string;
  submissionDate: string;
  jurisdiction: string;
  lastUpdated: string;
  nextDeadline?: string;
  description?: string;
  logo?: string;
}

interface ApplicationListProps {
  applications: Application[];
  onView?: (id: string) => void;
  sortConfig?: {
    key: keyof Application;
    direction: 'asc' | 'desc';
  };
  onSort?: (key: keyof Application) => void;
}

export default function ApplicationList({
  applications,
  onView,
  sortConfig,
  onSort,
}: ApplicationListProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'registered':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSortIcon = (key: keyof Application) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort?.('title')}
            >
              Title/Reference {getSortIcon('title')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort?.('type')}
            >
              Type {getSortIcon('type')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort?.('status')}
            >
              Status {getSortIcon('status')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort?.('jurisdiction')}
            >
              Jurisdiction {getSortIcon('jurisdiction')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort?.('submissionDate')}
            >
              Filed {getSortIcon('submissionDate')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort?.('nextDeadline')}
            >
              Next Deadline {getSortIcon('nextDeadline')}
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applications.map((application) => (
            <tr
              key={application.id}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{application.title}</div>
                    <div className="text-sm text-gray-500">{application.reference}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-900 capitalize">{application.type}</span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    application.status
                  )}`}
                >
                  {application.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-900">{application.jurisdiction}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-900">
                  {format(new Date(application.submissionDate), 'MMM d, yyyy')}
                </span>
              </td>
              <td className="px-6 py-4">
                {application.nextDeadline ? (
                  <span className="text-sm text-orange-600">
                    {format(new Date(application.nextDeadline), 'MMM d, yyyy')}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                <button
                  onClick={() => onView?.(application.id)}
                  className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                >
                  View
                  <ChevronRight className="ml-1 w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 