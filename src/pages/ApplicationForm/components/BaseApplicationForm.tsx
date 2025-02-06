import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ApplicationFormData } from '../types';
import FormField from '../../../components/FormField';

interface Props {
  form: UseFormReturn<ApplicationFormData>;
  onTypeChange: (type: ApplicationFormData['type']) => void;
}

export default function BaseApplicationForm({ form, onTypeChange }: Props) {
  const { register, formState: { errors }, watch } = form;
  const type = watch('type');

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">
          Application Type
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                type="radio"
                {...register('type')}
                value="trademark"
                onChange={() => onTypeChange('trademark')}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700">
                Trademark
              </label>
              <p className="text-gray-500">
                Protect your brand identity
              </p>
            </div>
          </div>

          <div className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                type="radio"
                {...register('type')}
                value="copyright"
                onChange={() => onTypeChange('copyright')}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700">
                Copyright
              </label>
              <p className="text-gray-500">
                Protect your creative works
              </p>
            </div>
          </div>

          <div className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                type="radio"
                {...register('type')}
                value="patent"
                onChange={() => onTypeChange('patent')}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700">
                Patent
              </label>
              <p className="text-gray-500">
                Protect your inventions
              </p>
            </div>
          </div>
        </div>

        {errors.type && (
          <p className="text-sm text-red-600">
            {errors.type.message}
          </p>
        )}
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">
          Applicant Information
        </h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Full Name"
            error={errors.applicantName?.message}
          >
            <input
              type="text"
              {...register('applicantName')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </FormField>

          <FormField
            label="Email"
            error={errors.contactEmail?.message}
          >
            <input
              type="email"
              {...register('contactEmail')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </FormField>

          <FormField
            label="Phone"
            error={errors.contactPhone?.message}
          >
            <input
              type="tel"
              {...register('contactPhone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </FormField>

          <FormField
            label="Country"
            error={errors.applicantCountry?.message}
          >
            <input
              type="text"
              {...register('applicantCountry')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </FormField>
        </div>

        <FormField
          label="Address"
          error={errors.applicantAddress?.message}
        >
          <textarea
            {...register('applicantAddress')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </FormField>

        <FormField
          label="Representative (Optional)"
          error={errors.representative?.message}
        >
          <input
            type="text"
            {...register('representative')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </FormField>
      </div>
    </div>
  );
} 