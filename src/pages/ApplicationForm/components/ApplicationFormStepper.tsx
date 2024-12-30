import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import ApplicantInfo from './steps/ApplicantInfo';
import TrademarkDetails from './steps/TrademarkDetails';
import GoodsServices from './steps/GoodsServices';
import Review from './steps/Review';

interface Props {
  currentStep: number;
  form: UseFormReturn<any>;
  isLoading: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const steps = [
  { title: 'Applicant Information', component: ApplicantInfo },
  { title: 'Trademark Details', component: TrademarkDetails },
  { title: 'Goods & Services', component: GoodsServices },
  { title: 'Review & Submit', component: Review },
];

export default function ApplicationFormStepper({
  currentStep,
  form,
  isLoading,
  onSubmit,
  onCancel,
}: Props) {
  const CurrentStepComponent = steps[currentStep].component;

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