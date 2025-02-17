import React from 'react';
import { UseFormReturn } from 'react-hook-form';

interface Props {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isLastStep: boolean;
}

export default function ClassSelection({ form, onSubmit, onCancel, isLoading, isLastStep }: Props) {
  return (
    <div className="space-y-4">
      <label htmlFor="classes" className="block font-medium">Select Classes</label>
      <input
        id="classes"
        type="text"
        placeholder="Enter classes (comma separated)"
        className="input"
        {...form.register('classes', { required: 'Class selection is required' })}
      />
      {form.formState.errors.classes && (
        <span className="error text-red-500">{form.formState.errors.classes.message}</span>
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