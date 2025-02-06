import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import FormField from '../../../components/FormField';
import FileUpload, { FileUploadValue } from '../../../components/FileUpload';
import GoodsServicesWizard from './steps/GoodsServicesWizard';
import { ApplicationFormData, TrademarkDetails as TrademarkDetailsType } from '../types';

interface Props {
  form: UseFormReturn<ApplicationFormData>;
}

export default function TrademarkDetails({ form }: Props) {
  const { register, formState: { errors }, setValue, watch } = form;
  const details = watch('details') as TrademarkDetailsType;
  const detailsErrors = errors.details as any;

  const handleFileChange = (files: FileUploadValue[]) => {
    setValue('details.logo', files[0]);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Trademark Details
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Provide information about your trademark
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label="Trademark Name"
          error={detailsErrors?.trademarkName?.message}
        >
          <input
            type="text"
            {...register('details.trademarkName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </FormField>

        <FormField
          label="Description"
          error={detailsErrors?.description?.message}
        >
          <textarea
            {...register('details.description')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </FormField>

        <FormField
          label="Use Status"
          error={detailsErrors?.useStatus?.message}
        >
          <select
            {...register('details.useStatus')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="inUse">Currently in use</option>
            <option value="intentToUse">Intent to use</option>
          </select>
        </FormField>

        <FormField
          label="Logo"
          optional
          error={detailsErrors?.logo?.message}
        >
          <FileUpload
            value={details.logo ? [details.logo] : []}
            onChange={handleFileChange}
            maxFiles={1}
            accept={{
              'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.svg'],
            }}
          />
        </FormField>

        <div className="border-t border-gray-200 pt-6">
          <GoodsServicesWizard
            form={form as UseFormReturn<any>}
            onSubmit={() => {}}
            onCancel={() => {}}
            onBack={() => {}}
            isLoading={false}
            isLastStep={false}
          />
        </div>
      </div>
    </div>
  );
} 