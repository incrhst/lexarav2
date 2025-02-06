import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import FormField from '../../../../components/FormField';
import StepActions from '../StepActions';

interface Props {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isLastStep: boolean;
}

export default function IPDetails({
  form,
  onSubmit,
  onCancel,
  isLoading,
  isLastStep,
}: Props) {
  const { register, formState: { errors } } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        label="IP Name"
        error={errors.trademarkName?.message}
      >
        <input
          type="text"
          {...register('trademarkName', { required: 'IP name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter the IP name"
        />
      </FormField>

      <FormField
        label="Description"
        error={errors.trademarkDescription?.message}
      >
        <textarea
          {...register('trademarkDescription', {
            required: 'Description is required',
            minLength: {
              value: 50,
              message: 'Description must be at least 50 characters',
            },
          })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Describe your intellectual property in detail..."
        />
      </FormField>

      <FormField
        label="Use Status"
        error={errors.useStatus?.message}
      >
        <select
          {...register('useStatus', { required: 'Use status is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select use status</option>
          <option value="inUse">Currently in use</option>
          <option value="intentToUse">Intent to use</option>
        </select>
      </FormField>

      <FormField
        label="Logo/Image"
        optional
        error={errors.logo?.message}
      >
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <div className="text-sm text-gray-600">
              <label
                htmlFor="logo"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <span>Upload a file</span>
                <input
                  id="logo"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  {...register('logo')}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
          </div>
        </div>
      </FormField>

      <StepActions
        onCancel={onCancel}
        isLoading={isLoading}
        isLastStep={isLastStep}
      />
    </form>
  );
}