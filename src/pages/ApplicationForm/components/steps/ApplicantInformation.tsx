import React from 'react';
import { UseFormReturn } from 'react-hook-form';

interface Props {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isLastStep: boolean;
}

export default function ApplicantInformation({ form, onSubmit, onCancel, isLoading, isLastStep }: Props) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div>
        <label htmlFor="applicantName" className="block font-medium">Applicant Name</label>
        <input
          id="applicantName"
          type="text"
          placeholder="Your Name"
          className="input"
          {...form.register('applicantName', { required: 'Applicant Name is required' })}
        />
        {form.formState.errors.applicantName && <span className="error text-red-500">{form.formState.errors.applicantName.message}</span>}
      </div>
      <div>
        <label htmlFor="contactEmail" className="block font-medium">Email</label>
        <input
          id="contactEmail"
          type="email"
          placeholder="Email Address"
          className="input"
          {...form.register('contactEmail', { required: 'Email is required' })}
        />
        {form.formState.errors.contactEmail && <span className="error text-red-500">{form.formState.errors.contactEmail.message}</span>}
      </div>
      <div>
        <label htmlFor="contactPhone" className="block font-medium">Phone</label>
        <input
          id="contactPhone"
          type="tel"
          placeholder="Phone Number"
          className="input"
          {...form.register('contactPhone')}
        />
      </div>
      <div className="flex justify-between mt-8">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary" disabled={isLoading}>{isLastStep ? 'Submit' : 'Next'}</button>
      </div>
    </form>
  );
} 