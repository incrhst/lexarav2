import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import ApplicantInfo from './steps/ApplicantInfo';
import ApplicationType from './steps/ApplicationType';
import IPDetails from './steps/TrademarkDetails';
import CopyrightDetails from './steps/CopyrightDetails';
import PatentDetails from './steps/PatentDetails';
import GoodsServices from './steps/GoodsServices';
import Review from './steps/Review';

interface Props {
  currentStep: number;
  form: UseFormReturn<any>;
  isLoading: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ApplicationFormStepper({
  currentStep,
  form,
  isLoading,
  onSubmit,
  onCancel,
}: Props) {
  const applicationType = form.watch('applicationType');

  const getSteps = () => {
    const baseSteps = [
      { title: 'Application Type', component: ApplicationType },
      { title: 'Applicant Information', component: ApplicantInfo },
    ];

    switch (applicationType) {
      case 'trademark':
        return [
          ...baseSteps,
          { title: 'Trademark Details', component: IPDetails },
          { title: 'Goods & Services', component: GoodsServices },
          { title: 'Review & Submit', component: Review },
        ];
      case 'copyright':
        return [
          ...baseSteps,
          { title: 'Copyright Details', component: CopyrightDetails },
          { title: 'Review & Submit', component: Review },
        ];
      case 'patent':
        return [
          ...baseSteps,
          { title: 'Patent Details', component: PatentDetails },
          { title: 'Review & Submit', component: Review },
        ];
      default:
        return baseSteps;
    }
  };

  const steps = getSteps();
  const CurrentStepComponent = steps[currentStep]?.component;

  if (!CurrentStepComponent) {
    return null;
  }

  return (
    <div className="space-y-8">
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={`${
                index !== steps.length - 1 ? 'flex-1' : ''
              } relative`}
            >
              <div className="flex items-center">
                <span
                  className={`${
                    index <= currentStep
                      ? 'bg-indigo-600'
                      : 'bg-gray-200'
                  } h-2 w-2 rounded-full`}
                />
                <div
                  className={`${
                    index === steps.length - 1 ? 'hidden' : ''
                  } ${
                    index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                  } flex-1 h-0.5 mx-2`}
                />
              </div>
              <span className="mt-2 block text-xs font-medium text-gray-500">
                {step.title}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="bg-white shadow rounded-lg p-8">
        <CurrentStepComponent
          form={form}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          isLastStep={currentStep === steps.length - 1}
        />
      </div>
    </div>
  );
}