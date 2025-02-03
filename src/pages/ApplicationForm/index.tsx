import React from 'react';
import { useNavigate } from 'react-router-dom';
import ApplicationFormStepper from './components/ApplicationFormStepper';
import { useApplicationForm } from './hooks/useApplicationForm';

export default function ApplicationForm() {
  const navigate = useNavigate();
  const { currentStep, form, isLoading, handleSubmit } = useApplicationForm();
  const applicationType = form.watch('applicationType');

  const getHeaderText = () => {
    if (!applicationType) {
      return {
        title: 'New IP Application',
        description: 'Start by selecting the type of intellectual property you want to protect',
      };
    }

    const types = {
      trademark: {
        title: 'New Trademark Application',
        description: 'Protect your brand identity by registering a trademark',
      },
      copyright: {
        title: 'New Copyright Application',
        description: 'Register and protect your original creative works',
      },
      patent: {
        title: 'New Patent Application',
        description: 'Protect your invention with a patent application',
      },
    };

    return types[applicationType as keyof typeof types];
  };

  const headerText = getHeaderText();

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{headerText.title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {headerText.description}
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