import React from 'react';
import { UseFormReturn } from 'react-hook-form';

interface Props {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isLastStep: boolean;
}

export default function IPTypeSelection({ form, onSubmit, onCancel, isLoading, isLastStep }: Props) {
  return (
    <div className="space-y-4">
      <label htmlFor="ipType" className="block font-medium">Select IP Type</label>
      <select
        id="ipType"
        className="input"
        {...form.register('ipType', { required: 'IP Type is required' })}
      >
        <option value="">Select IP Type</option>
        <option value="trademark">Trademark</option>
        <option value="patent">Patent</option>
        <option value="copyright">Copyright</option>
      </select>
      {form.formState.errors.ipType && <span className="error text-red-500">{form.formState.errors.ipType.message}</span>}
      <div className="flex justify-between mt-8">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="button" onClick={onSubmit} className="btn-primary" disabled={isLoading}>{isLastStep ? 'Submit' : 'Next'}</button>
      </div>
    </div>
  );
} 