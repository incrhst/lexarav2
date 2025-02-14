import React, { useState } from 'react';
import { useExamination } from '../../hooks/useExamination';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

interface OfficeActionsProps {
  applicationId: string;
  examinerId: string;
}

export default function OfficeActions({
  applicationId,
  examinerId,
}: OfficeActionsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [type, setType] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState('');

  const {
    loading,
    error,
    examinationRecord,
    addOfficeAction
  } = useExamination(applicationId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !content || !dueDate) return;

    await addOfficeAction(type, content, new Date(dueDate));
    setIsCreating(false);
    setType('');
    setContent('');
    setDueDate('');
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-10 bg-gray-100 rounded w-1/4"></div>
        <div className="h-32 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-6">
        Error loading office actions: {error.message}
      </div>
    );
  }

  if (!examinationRecord) {
    return (
      <div className="text-gray-500 p-6">
        No examination record found
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Office Actions</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          New Office Action
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-md">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select type...</option>
              <option value="formal_requirements">Formal Requirements</option>
              <option value="substantive_examination">Substantive Examination</option>
              <option value="classification">Classification</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe the office action..."
              required
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setType('');
                setContent('');
                setDueDate('');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Office Action
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {examinationRecord.office_actions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No office actions yet
          </p>
        ) : (
          examinationRecord.office_actions.map((action) => (
            <div
              key={action.id}
              className="bg-white shadow rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {action.type}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {action.content}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    action.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : action.status === 'responded'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {action.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                  {action.status === 'responded' && <CheckCircle className="w-4 h-4 mr-1" />}
                  {action.status === 'expired' && <XCircle className="w-4 h-4 mr-1" />}
                  {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                </span>
              </div>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Issued: {new Date(action.issuedDate).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Due: {new Date(action.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 