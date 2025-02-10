import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { defaultChecklistItems } from '../../utils/examination';

interface ChecklistItemProps {
  id: string;
  description: string;
  status: 'pending' | 'passed' | 'failed';
  notes?: string;
  onUpdateStatus: (status: 'pending' | 'passed' | 'failed') => void;
  onUpdateNotes: (notes: string) => void;
}

const ChecklistItem = ({
  description,
  status,
  notes,
  onUpdateStatus,
  onUpdateNotes,
}: ChecklistItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getStatusIcon()}
          <div>
            <p className="text-sm font-medium text-gray-900">{description}</p>
            {notes && !isExpanded && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-1">{notes}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-500"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
              value={notes}
              onChange={(e) => onUpdateNotes(e.target.value)}
              placeholder="Add examination notes..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => onUpdateStatus('passed')}
              className={`flex-1 inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                status === 'passed'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Pass
            </button>
            <button
              onClick={() => onUpdateStatus('failed')}
              className={`flex-1 inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                status === 'failed'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Fail
            </button>
            <button
              onClick={() => onUpdateStatus('pending')}
              className={`flex-1 inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                status === 'pending'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Pending
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ExaminationChecklistProps {
  applicationId: string;
  examinerId: string;
}

export default function ExaminationChecklist({
  applicationId,
  examinerId,
}: ExaminationChecklistProps) {
  const [checklist, setChecklist] = useState({
    formalRequirements: {
      completed: false,
      items: defaultChecklistItems.formalRequirements,
    },
    substantiveExamination: {
      completed: false,
      items: defaultChecklistItems.substantiveExamination,
    },
    classification: {
      completed: false,
      items: defaultChecklistItems.classification,
    },
  });

  const updateChecklistItem = (
    section: keyof typeof checklist,
    itemId: string,
    updates: { status?: 'pending' | 'passed' | 'failed'; notes?: string }
  ) => {
    setChecklist((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: prev[section].items.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      },
    }));
  };

  const getSectionProgress = (section: keyof typeof checklist) => {
    const items = checklist[section].items;
    const completed = items.filter((item) => item.status !== 'pending').length;
    return Math.round((completed / items.length) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Formal Requirements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Formal Requirements
          </h3>
          <span className="text-sm text-gray-500">
            {getSectionProgress('formalRequirements')}% Complete
          </span>
        </div>
        <div className="space-y-4">
          {checklist.formalRequirements.items.map((item) => (
            <ChecklistItem
              key={item.id}
              {...item}
              onUpdateStatus={(status) =>
                updateChecklistItem('formalRequirements', item.id, { status })
              }
              onUpdateNotes={(notes) =>
                updateChecklistItem('formalRequirements', item.id, { notes })
              }
            />
          ))}
        </div>
      </div>

      {/* Substantive Examination */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Substantive Examination
          </h3>
          <span className="text-sm text-gray-500">
            {getSectionProgress('substantiveExamination')}% Complete
          </span>
        </div>
        <div className="space-y-4">
          {checklist.substantiveExamination.items.map((item) => (
            <ChecklistItem
              key={item.id}
              {...item}
              onUpdateStatus={(status) =>
                updateChecklistItem('substantiveExamination', item.id, { status })
              }
              onUpdateNotes={(notes) =>
                updateChecklistItem('substantiveExamination', item.id, { notes })
              }
            />
          ))}
        </div>
      </div>

      {/* Classification */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Classification</h3>
          <span className="text-sm text-gray-500">
            {getSectionProgress('classification')}% Complete
          </span>
        </div>
        <div className="space-y-4">
          {checklist.classification.items.map((item) => (
            <ChecklistItem
              key={item.id}
              {...item}
              onUpdateStatus={(status) =>
                updateChecklistItem('classification', item.id, { status })
              }
              onUpdateNotes={(notes) =>
                updateChecklistItem('classification', item.id, { notes })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
} 