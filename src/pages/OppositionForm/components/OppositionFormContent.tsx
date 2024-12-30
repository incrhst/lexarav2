import React from 'react';
import { useForm } from 'react-hook-form';
import { Application } from '../../../types';
import FormField from '../../../components/FormField';

interface Props {
  application: Application;
  onSubmit: (data: OppositionFormData) => void;
  onCancel: () => void;
}

interface OppositionFormData {
  opponentName: string;
  reason: string;
  evidenceUrls: string[];
}

export default function OppositionFormContent({ application, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OppositionFormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <FormField
            label="Your Full Name"
            error={errors.opponentName?.message}
          >
            <input
              type="text"
              {...register('opponentName', { required: 'Full name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </FormField>

          <FormField
            label="Reason for Opposition"
            error={errors.reason?.message}
          >
            <textarea
              {...register('reason', {
                required: 'Please provide a reason for your opposition',
                minLength: {
                  value: 50,
                  message: 'Please provide a detailed explanation (minimum 50 characters)',
                },
              })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Explain why you are opposing this application..."
            />
          </FormField>

          <FormField
            label="Supporting Evidence"
            error={errors.evidenceUrls?.message}
          >
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="text-sm text-gray-600">
                  <label
                    htmlFor="evidence"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload files</span>
                    <input
                      id="evidence"
                      type="file"
                      multiple
                      className="sr-only"
                      {...register('evidenceUrls')}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF up to 10MB each
                </p>
              </div>
            </div>
          </FormField>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Opposition'}
          </button>
        </div>
      </div>
    </form>
  );
}