import React from 'react';

interface Props {
  onCancel: () => void;
  isLoading: boolean;
  isLastStep: boolean;
}

export default function StepActions({
  onCancel,
  isLoading,
  isLastStep,
}: Props) {
  return (
    <div className="flex justify-end space-x-4 pt-6 border-t">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isLoading
          ? 'Saving...'
          : isLastStep
          ? 'Submit Application'
          : 'Next Step'}
      </button>
    </div>
  );
}