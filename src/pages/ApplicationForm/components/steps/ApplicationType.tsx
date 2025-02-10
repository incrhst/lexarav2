import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BookCopy, Copyright, Lightbulb } from 'lucide-react';
import FormField from '../../../../components/FormField';
import StepActions from '../StepActions';

interface Props {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isLastStep: boolean;
}

export default function ApplicationType({
  form,
  onSubmit,
  onCancel,
  isLoading,
  isLastStep,
}: Props) {
  const { register, formState: { errors }, watch } = form;
  const selectedType = watch('applicationType');
  const selectedSubType = watch('applicationSubType');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        label="Select Application Type"
        error={errors.applicationType?.message}
      >
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label
            className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
              selectedType === 'trademark'
                ? 'border-indigo-500 ring-2 ring-indigo-500'
                : 'border-gray-300'
            }`}
          >
            <input
              type="radio"
              {...register('applicationType', { required: 'Please select an application type' })}
              value="trademark"
              className="sr-only"
            />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm">
                  <div className="flex items-center">
                    <BookCopy className="h-6 w-6 text-indigo-600 mr-2" />
                    <p className="font-medium text-gray-900">Trademark</p>
                  </div>
                  <p className="text-gray-500 mt-1">
                    Protect your brand identity, including names, logos, and symbols
                  </p>
                </div>
              </div>
            </div>
          </label>

          <label
            className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
              selectedType === 'patent'
                ? 'border-indigo-500 ring-2 ring-indigo-500'
                : 'border-gray-300'
            }`}
          >
            <input
              type="radio"
              {...register('applicationType', { required: 'Please select an application type' })}
              value="patent"
              className="sr-only"
            />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm">
                  <div className="flex items-center">
                    <Lightbulb className="h-6 w-6 text-indigo-600 mr-2" />
                    <p className="font-medium text-gray-900">Patent</p>
                  </div>
                  <p className="text-gray-500 mt-1">
                    Protect your inventions, including new devices, methods, and processes
                  </p>
                </div>
              </div>
            </div>
          </label>

          <label
            className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
              selectedType === 'copyright'
                ? 'border-indigo-500 ring-2 ring-indigo-500'
                : 'border-gray-300'
            }`}
          >
            <input
              type="radio"
              {...register('applicationType', { required: 'Please select an application type' })}
              value="copyright"
              className="sr-only"
            />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm">
                  <div className="flex items-center">
                    <Copyright className="h-6 w-6 text-indigo-600 mr-2" />
                    <p className="font-medium text-gray-900">Copyright</p>
                  </div>
                  <p className="text-gray-500 mt-1">
                    Protect your original works, including artistic, literary, and musical creations
                  </p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </FormField>

      {selectedType === 'trademark' && (
        <FormField
          label="Select Filing Type"
          error={errors.applicationSubType?.message}
        >
          <select
            {...register('applicationSubType', { required: 'Please select a filing type' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select filing type</option>
            <option value="new">New Registration</option>
            <option value="opposition">Opposition to Registration</option>
            <option value="renewal">Renewal Request (10-year)</option>
            <option value="changeOwnership">Change of Ownership</option>
            <option value="changeNameAddress">Change of Name/Address</option>
            <option value="powerOfAttorney">Power of Attorney</option>
            <option value="correction">Correction Request</option>
            <option value="counterStatement">Counter-Statement</option>
          </select>
        </FormField>
      )}

      {selectedType === 'patent' && (
        <FormField
          label="Select Filing Type"
          error={errors.applicationSubType?.message}
        >
          <select
            {...register('applicationSubType', { required: 'Please select a filing type' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select filing type</option>
            <option value="new">New Application</option>
            <option value="opposition">Opposition to Grant</option>
            <option value="renewal">Annual Renewal</option>
            <option value="nonVoluntaryLicense">Non-Voluntary License Request</option>
            <option value="changeOwnership">Change of Ownership</option>
            <option value="changeNameAddress">Change of Name/Address</option>
            <option value="powerOfAttorney">Power of Attorney</option>
            <option value="correction">Correction Request</option>
          </select>
        </FormField>
      )}

      <StepActions
        onCancel={onCancel}
        isLoading={isLoading}
        isLastStep={isLastStep}
      />
    </form>
  );
} 

