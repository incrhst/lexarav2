import React, { useState } from 'react';
import { ArrowUpDown, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { ExaminationStatus } from '../../utils/validation';

interface ApplicationQueueProps {
  examinerId: string;
  onSelectApplication: (applicationId: string) => void;
  selectedApplicationId: string | null;
}

interface QueueItem {
  id: string;
  title: string;
  reference: string;
  status: ExaminationStatus;
  submissionDate: string;
  priority: 'high' | 'medium' | 'low';
}

export default function ApplicationQueue({
  examinerId,
  onSelectApplication,
  selectedApplicationId,
}: ApplicationQueueProps) {
  const [sortField, setSortField] = useState<keyof QueueItem>('submissionDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<ExaminationStatus | 'all'>('all');

  const statusColors: Record<ExaminationStatus, string> = {
    pending_review: 'bg-yellow-100 text-yellow-800',
    under_examination: 'bg-blue-100 text-blue-800',
    office_action: 'bg-purple-100 text-purple-800',
    response_required: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  };

  const getStatusIcon = (status: ExaminationStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending_review':
      case 'under_examination':
        return <Clock className="w-5 h-5" />;
      case 'rejected':
      case 'withdrawn':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const handleSort = (field: keyof QueueItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {/* Filters */}
      <div className="p-4 bg-gray-50">
        <div className="flex space-x-2">
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as ExaminationStatus | 'all')}
          >
            <option value="all">All Status</option>
            <option value="pending_review">Pending Review</option>
            <option value="under_examination">Under Examination</option>
            <option value="office_action">Office Action</option>
            <option value="response_required">Response Required</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Queue Headers */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-500">
        <button
          className="col-span-5 flex items-center space-x-1"
          onClick={() => handleSort('title')}
        >
          <span>Application</span>
          <ArrowUpDown className="w-4 h-4" />
        </button>
        <button
          className="col-span-3 flex items-center space-x-1"
          onClick={() => handleSort('status')}
        >
          <span>Status</span>
          <ArrowUpDown className="w-4 h-4" />
        </button>
        <button
          className="col-span-4 flex items-center space-x-1"
          onClick={() => handleSort('submissionDate')}
        >
          <span>Date</span>
          <ArrowUpDown className="w-4 h-4" />
        </button>
      </div>

      {/* Queue Items */}
      <div className="divide-y divide-gray-200">
        {/* Map through queue items here */}
        {[].map((item: QueueItem) => (
          <button
            key={item.id}
            className={`w-full p-4 hover:bg-gray-50 grid grid-cols-12 gap-4 text-sm ${
              selectedApplicationId === item.id ? 'bg-indigo-50' : ''
            }`}
            onClick={() => onSelectApplication(item.id)}
          >
            <div className="col-span-5">
              <div className="font-medium text-gray-900">{item.title}</div>
              <div className="text-gray-500">{item.reference}</div>
            </div>
            <div className="col-span-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[item.status]
                }`}
              >
                {getStatusIcon(item.status)}
                <span className="ml-1">{item.status.replace('_', ' ')}</span>
              </span>
            </div>
            <div className="col-span-4 text-gray-500">
              {new Date(item.submissionDate).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {[].length === 0 && (
        <div className="p-4 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-2">No applications in queue</p>
        </div>
      )}
    </div>
  );
} 