import React from 'react';
import { UseFormReturn } from 'react-hook-form';

interface Props {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isLastStep: boolean;
}

export default function DocumentUpload({ form, onSubmit, onCancel, isLoading, isLastStep }: Props) {
  return (
    <div className="space-y-4">
      <label htmlFor="documents" className="block font-medium">Upload Documents</label>
      <input
        id="documents"
        type="file"
        multiple
        className="input"
        {...form.register('documents', { required: 'Document upload is required' })}
      />
      {form.formState.errors.documents && (
        <span className="error text-red-500">{form.formState.errors.documents.message}</span>
      )}
      <div className="flex justify-between mt-8">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="button" onClick={onSubmit} className="btn-primary" disabled={isLoading}>
          {isLastStep ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
} 