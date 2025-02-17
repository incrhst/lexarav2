import React from 'react';
import { UseFormReturn } from 'react-hook-form';

interface Props {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isLastStep: boolean;
}

export default function MarkDetails({ form, onSubmit, onCancel, isLoading, isLastStep }: Props) {
  return (
    <div className="space-y-4">
      <label htmlFor="markDetails" className="block font-medium">Mark Details</label>
      <textarea
        id="markDetails"
        placeholder="Enter mark details"
        className="input"
        {...form.register('markDetails', { required: 'Mark details are required' })}
      />
      {form.formState.errors.markDetails && (
        <span className="error text-red-500">{form.formState.errors.markDetails.message}</span>
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