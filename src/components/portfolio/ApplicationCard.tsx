import React from 'react';
import { Calendar, Globe, Tag, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

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

interface ApplicationCardProps {
  application: Application;
  onView?: (id: string) => void;
}

export default function ApplicationCard({ application, onView }: ApplicationCardProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 truncate">{application.title}</h3>
            <p className="text-sm text-gray-500">{application.reference}</p>
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              application.status
            )}`}
          >
            {application.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Tag className="w-4 h-4 mr-2" />
            <span className="capitalize">{application.type}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Globe className="w-4 h-4 mr-2" />
            <span>{application.jurisdiction}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Filed: {format(new Date(application.submissionDate), 'MMM d, yyyy')}</span>
          </div>
          {application.nextDeadline && (
            <div className="flex items-center text-sm text-orange-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Due: {format(new Date(application.nextDeadline), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {application.description && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">{application.description}</p>
        )}

        {/* Action Button */}
        <button
          onClick={() => onView?.(application.id)}
          className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View Details
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 