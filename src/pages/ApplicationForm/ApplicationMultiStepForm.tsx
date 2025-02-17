import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';

// Import step components
import ApplicantInformation from './components/steps/ApplicantInformation';
import IPTypeSelection from './components/steps/IPTypeSelection';
import MarkDetails from './components/steps/MarkDetails';
import ClassSelection from './components/steps/ClassSelection';
import DocumentUpload from './components/steps/DocumentUpload';
import PaymentProcessing from './components/steps/PaymentProcessing';

// Define form values interface
interface FormValues {
  // Applicant Information
  applicantName: string;
  contactEmail: string;
  contactPhone?: string;
  
  // IP Type Selection
  ipType: string;
  
  // Mark Details
  markDetails: string;
  
  // Class Selection
  classes: string;
  
  // Document Upload
  documents: FileList;
  
  // Payment Processing
  paymentInfo: {
    amount: number;
    method: string;
  };
}

// Define the steps for the multi-step form
const steps = [
  { component: ApplicantInformation, title: 'Applicant Information' },
  { component: IPTypeSelection, title: 'IP Type Selection' },
  { component: MarkDetails, title: 'Mark Details' },
  { component: ClassSelection, title: 'Class Selection' },
  { component: DocumentUpload, title: 'Document Upload' },
  { component: PaymentProcessing, title: 'Payment Processing' }
];

export default function ApplicationMultiStepForm() {
  // Load saved progress from localStorage
  const loadProgress = (): Partial<FormValues> => {
    try {
      const data = localStorage.getItem('applicationForm');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  };

  // Save progress to localStorage
  const saveProgress = (data: FormValues) => {
    localStorage.setItem('applicationForm', JSON.stringify(data));
  };

  const methods = useForm<FormValues>({ defaultValues: loadProgress() });
  const [currentStep, setCurrentStep] = useState(0);

  const CurrentStepComponent = steps[currentStep].component;

  const nextStep = async () => {
    // Validate current step fields
    const valid = await methods.trigger();
    if (!valid) return;

    // Save progress
    saveProgress(methods.getValues() as FormValues);
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // Save final progress and handle final submission
    saveProgress(data);
    console.log('Submitting form data:', data);
    // TODO: Implement API submission logic here
  };

  // When component mounts, reset form with saved progress
  useEffect(() => {
    const data = loadProgress();
    methods.reset(data);
  }, []);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
        <div>
          <CurrentStepComponent 
            form={methods}
            onSubmit={currentStep === steps.length - 1 ? methods.handleSubmit(onSubmit) : nextStep}
            onCancel={currentStep === 0 ? () => {} : prevStep}
            isLoading={methods.formState.isSubmitting}
            isLastStep={currentStep === steps.length - 1}
          />
        </div>
        <div className="flex justify-between">
          {currentStep > 0 && (
            <button type="button" onClick={prevStep} className="btn-secondary">Previous</button>
          )}
          {currentStep < steps.length - 1 && (
            <button type="button" onClick={nextStep} className="btn-primary">Next</button>
          )}
          {currentStep === steps.length - 1 && (
            <button type="submit" className="btn-primary" disabled={methods.formState.isSubmitting}>Submit</button>
          )}
        </div>
      </form>
    </FormProvider>
  );
} 