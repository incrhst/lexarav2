import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useExamination } from '../../hooks/useExamination';

interface ExaminationDecisionProps {
  applicationId: string;
  examinerId: string;
}

export default function ExaminationDecision({
  applicationId,
  examinerId,
}: ExaminationDecisionProps) {
  const [reason, setReason] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<'approved' | 'rejected' | 'office_action' | null>(null);

  const {
    loading,
    error,
    examinationRecord,
    makeDecision
  } = useExamination(applicationId);

  const handleMakeDecision = async () => {
    if (!selectedOutcome || !reason.trim()) return;
    
    await makeDecision(selectedOutcome, reason);
    setIsConfirming(false);
    setReason('');
    setSelectedOutcome(null);
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
        Error loading examination record: {error.message}
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

  // If a decision has already been made
  if (examinationRecord.decision.outcome) {
    return (
      <div className="p-6">
        <div className={`rounded-md p-4 ${
          examinationRecord.decision.outcome === 'approved'
            ? 'bg-green-50'
            : examinationRecord.decision.outcome === 'rejected'
            ? 'bg-red-50'
            : 'bg-yellow-50'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {examinationRecord.decision.outcome === 'approved' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : examinationRecord.decision.outcome === 'rejected' ? (
                <XCircle className="h-5 w-5 text-red-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                examinationRecord.decision.outcome === 'approved'
                  ? 'text-green-800'
                  : examinationRecord.decision.outcome === 'rejected'
                  ? 'text-red-800'
                  : 'text-yellow-800'
              }`}>
                Application {examinationRecord.decision.outcome.replace('_', ' ')}
              </h3>
              <div className="mt-2 text-sm text-gray-700">
                <p>{examinationRecord.decision.reason}</p>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Decision made on: {new Date(examinationRecord.decision.date!).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Make Decision</h3>

      {!isConfirming ? (
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => {
              setSelectedOutcome('approved');
              setIsConfirming(true);
            }}
            className="relative block w-full rounded-lg border-2 border-dashed p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Approve
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedOutcome('office_action');
              setIsConfirming(true);
            }}
            className="relative block w-full rounded-lg border-2 border-dashed p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Office Action
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedOutcome('rejected');
              setIsConfirming(true);
            }}
            className="relative block w-full rounded-lg border-2 border-dashed p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Reject
            </span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason for {selectedOutcome?.replace('_', ' ')}
            </label>
            <textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={`Explain why the application is being ${selectedOutcome}...`}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsConfirming(false);
                setReason('');
                setSelectedOutcome(null);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={handleMakeDecision}
              disabled={!reason.trim()}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedOutcome === 'approved'
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : selectedOutcome === 'rejected'
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
              }`}
            >
              Confirm {selectedOutcome?.replace('_', ' ')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 