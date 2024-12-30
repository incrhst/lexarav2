import React from 'react';
import { useNavigate } from 'react-router-dom';
import ApplicationFormStepper from './components/ApplicationFormStepper';
import { useApplicationForm } from './hooks/useApplicationForm';

export default function ApplicationForm() {
  const navigate = useNavigate();
  const { currentStep, form, isLoading, handleSubmit } = useApplicationForm();

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Trademark Application</h1>
        <p className="mt-1 text-sm text-gray-500">
          Submit your trademark application by filling out the form below
        </p>
      </header>

      <ApplicationFormStepper
        currentStep={currentStep}
        form={form}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}