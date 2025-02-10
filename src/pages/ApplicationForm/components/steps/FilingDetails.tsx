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

export default function FilingDetails({
  form,
  onSubmit,
  onCancel,
  isLoading,
  isLastStep,
}: Props) {
  const { register, formState: { errors }, watch } = form;
  const applicationType = watch('applicationType');
  const applicationSubType = watch('applicationSubType');

  const renderTrademarkFields = () => {
    switch (applicationSubType) {
      case 'opposition':
        return (
          <>
            <FormField
              label="Opposition Grounds"
              error={errors.oppositionGrounds?.message}
            >
              <textarea
                {...register('oppositionGrounds', { required: 'Opposition grounds are required' })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Describe the grounds for opposition..."
              />
            </FormField>

            <FormField
              label="Supporting Evidence"
              error={errors.oppositionEvidence?.message}
            >
              <input
                type="file"
                {...register('oppositionEvidence', { required: 'Supporting evidence is required' })}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </FormField>
          </>
        );

      case 'renewal':
        return (
          <>
            <FormField
              label="Previous Registration Number"
              error={errors.previousRegistrationNumber?.message}
            >
              <input
                type="text"
                {...register('previousRegistrationNumber', { required: 'Registration number is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter the registration number"
              />
            </FormField>

            <FormField
              label="Renewal Period"
              error={errors.renewalPeriod?.message}
            >
              <input
                type="text"
                {...register('renewalPeriod', { required: 'Renewal period is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., 2024-2034"
              />
            </FormField>
          </>
        );

      case 'changeOwnership':
        return (
          <>
            <FormField
              label="Previous Owner Details"
              error={errors.previousOwnerDetails?.message}
            >
              <textarea
                {...register('previousOwnerDetails', { required: 'Previous owner details are required' })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter previous owner's details..."
              />
            </FormField>

            <FormField
              label="New Owner Details"
              error={errors.newOwnerDetails?.message}
            >
              <textarea
                {...register('newOwnerDetails', { required: 'New owner details are required' })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter new owner's details..."
              />
            </FormField>
          </>
        );

      case 'changeNameAddress':
        return (
          <FormField
            label="Name/Address Change Details"
            error={errors.nameAddressChangeDetails?.message}
          >
            <textarea
              {...register('nameAddressChangeDetails', { required: 'Change details are required' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe the changes in name or address..."
            />
          </FormField>
        );

      case 'powerOfAttorney':
        return (
          <FormField
            label="Power of Attorney Document"
            error={errors.powerOfAttorneyDocument?.message}
          >
            <input
              type="file"
              {...register('powerOfAttorneyDocument', { required: 'Power of Attorney document is required' })}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </FormField>
        );

      case 'correction':
        return (
          <FormField
            label="Correction Details"
            error={errors.correctionDetails?.message}
          >
            <textarea
              {...register('correctionDetails', { required: 'Correction details are required' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe the corrections needed..."
            />
          </FormField>
        );

      case 'counterStatement':
        return (
          <>
            <FormField
              label="Counter-Statement Details"
              error={errors.counterStatementDetails?.message}
            >
              <textarea
                {...register('counterStatementDetails', { required: 'Counter-statement details are required' })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Provide your counter-statement..."
              />
            </FormField>

            <FormField
              label="Supporting Evidence"
              error={errors.counterStatementEvidence?.message}
            >
              <input
                type="file"
                {...register('counterStatementEvidence', { required: 'Supporting evidence is required' })}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </FormField>
          </>
        );

      default:
        return null;
    }
  };

  const renderPatentFields = () => {
    switch (applicationSubType) {
      case 'opposition':
        return (
          <>
            <FormField
              label="Opposition Grounds"
              error={errors.oppositionPatentGrounds?.message}
            >
              <textarea
                {...register('oppositionPatentGrounds', { required: 'Opposition grounds are required' })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Describe the grounds for opposition..."
              />
            </FormField>

            <FormField
              label="Supporting Evidence"
              error={errors.oppositionPatentEvidence?.message}
            >
              <input
                type="file"
                {...register('oppositionPatentEvidence', { required: 'Supporting evidence is required' })}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </FormField>
          </>
        );

      case 'renewal':
        return (
          <FormField
            label="Annual Renewal Year"
            error={errors.annualRenewalYear?.message}
          >
            <input
              type="number"
              {...register('annualRenewalYear', { 
                required: 'Renewal year is required',
                min: { value: 1, message: 'Year must be greater than 0' },
                max: { value: 20, message: 'Year cannot exceed 20' }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter the renewal year (1-20)"
            />
          </FormField>
        );

      case 'nonVoluntaryLicense':
        return (
          <>
            <FormField
              label="License Request Details"
              error={errors.licenseRequestDetails?.message}
            >
              <textarea
                {...register('licenseRequestDetails', { required: 'License request details are required' })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Describe the license request..."
              />
            </FormField>

            <FormField
              label="Justification"
              error={errors.licenseRequestJustification?.message}
            >
              <textarea
                {...register('licenseRequestJustification', { required: 'Justification is required' })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Provide justification for the non-voluntary license request..."
              />
            </FormField>
          </>
        );

      case 'changeOwnership':
        return (
          <FormField
            label="Ownership Transfer Details"
            error={errors.patentOwnershipTransfer?.message}
          >
            <textarea
              {...register('patentOwnershipTransfer', { required: 'Transfer details are required' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe the ownership transfer details..."
            />
          </FormField>
        );

      case 'changeNameAddress':
        return (
          <FormField
            label="Name/Address Change Details"
            error={errors.patentNameAddressChange?.message}
          >
            <textarea
              {...register('patentNameAddressChange', { required: 'Change details are required' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe the changes in name or address..."
            />
          </FormField>
        );

      case 'powerOfAttorney':
        return (
          <FormField
            label="Power of Attorney Document"
            error={errors.patentPowerOfAttorney?.message}
          >
            <input
              type="file"
              {...register('patentPowerOfAttorney', { required: 'Power of Attorney document is required' })}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </FormField>
        );

      case 'correction':
        return (
          <FormField
            label="Correction Details"
            error={errors.patentCorrectionDetails?.message}
          >
            <textarea
              {...register('patentCorrectionDetails', { required: 'Correction details are required' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe the corrections needed..."
            />
          </FormField>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {applicationType === 'trademark' && renderTrademarkFields()}
      {applicationType === 'patent' && renderPatentFields()}

      <StepActions
        onCancel={onCancel}
        isLoading={isLoading}
        isLastStep={isLastStep}
      />
    </form>
  );
} 