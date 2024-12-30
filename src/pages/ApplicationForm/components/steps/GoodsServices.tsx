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

export default function GoodsServices({
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
        label="Nice Classification"
        error={errors.goodsServicesClass?.message}
      >
        <div className="mt-1 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((classNum) => (
            <div key={classNum} className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  value={classNum}
                  {...register('goodsServicesClass', {
                    required: 'Select at least one class',
                  })}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  Class {classNum}
                </label>
              </div>
            </div>
          ))}
        </div>
      </FormField>

      <FormField
        label="Territory"
        error={errors.territory?.message}
      >
        <select
          multiple
          {...register('territory', {
            required: 'Select at least one territory',
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="US">United States</option>
          <option value="EU">European Union</option>
          <option value="UK">United Kingdom</option>
          <option value="CN">China</option>
          <option value="JP">Japan</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Hold Ctrl/Cmd to select multiple territories
        </p>
      </FormField>

      <StepActions
        onCancel={onCancel}
        isLoading={isLoading}
        isLastStep={isLastStep}
      />
    </form>
  );
}