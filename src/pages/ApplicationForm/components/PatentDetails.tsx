import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ApplicationFormData, PatentDetails as PatentDetailsType } from '../types';
import FormField from '../../../components/FormField';
import { PlusCircle, XCircle } from 'lucide-react';

type PatentFormData = ApplicationFormData & {
  type: 'patent';
  details: PatentDetailsType;
};

interface Props {
  form: UseFormReturn<PatentFormData>;
}

export default function PatentDetails({ form }: Props) {
  const { register, formState: { errors }, watch, setValue } = form;
  const details = watch('details');
  const detailsErrors = errors.details as any;

  if (form.watch('type') !== 'patent') return null;

  const handleAddClaim = () => {
    const currentClaims = form.getValues('details.claims') || [];
    setValue('details.claims', [...currentClaims, '']);
  };

  const handleRemoveClaim = (index: number) => {
    const currentClaims = form.getValues('details.claims') || [];
    setValue('details.claims', currentClaims.filter((_, i) => i !== index));
  };

  const handleAddPriorArt = () => {
    const currentPriorArt = form.getValues('details.priorArt') || [];
    setValue('details.priorArt', [...currentPriorArt, '']);
  };

  const handleRemovePriorArt = (index: number) => {
    const currentPriorArt = form.getValues('details.priorArt') || [];
    setValue('details.priorArt', currentPriorArt.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">
          Patent Details
        </h3>

        <FormField
          label="Title of Invention"
          error={detailsErrors?.inventionTitle?.message}
        >
          <input
            type="text"
            {...register('details.inventionTitle')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </FormField>

        <FormField
          label="Technical Field"
          error={detailsErrors?.technicalField?.message}
        >
          <input
            type="text"
            {...register('details.technicalField')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </FormField>

        <FormField
          label="Abstract"
          error={detailsErrors?.abstract?.message}
        >
          <textarea
            {...register('details.abstract')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Provide a brief summary of your invention..."
          />
        </FormField>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-base font-medium text-gray-900">
              Claims
            </h4>
            <button
              type="button"
              onClick={handleAddClaim}
              className="inline-flex items-center text-sm text-primary hover:text-primary-dark"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Claim
            </button>
          </div>

          {detailsErrors?.claims?.message && (
            <p className="text-sm text-red-600">
              {detailsErrors.claims.message}
            </p>
          )}

          {(details.claims || []).map((claim, index) => (
            <div
              key={index}
              className="flex gap-4"
            >
              <div className="flex-1">
                <FormField
                  label={`Claim ${index + 1}`}
                  error={detailsErrors?.claims?.[index]?.message}
                >
                  <textarea
                    {...register(`details.claims.${index}`)}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </FormField>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveClaim(index)}
                className="mt-8 text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-base font-medium text-gray-900">
              Prior Art References
            </h4>
            <button
              type="button"
              onClick={handleAddPriorArt}
              className="inline-flex items-center text-sm text-primary hover:text-primary-dark"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Reference
            </button>
          </div>

          {(details.priorArt || []).map((reference, index) => (
            <div
              key={index}
              className="flex gap-4"
            >
              <div className="flex-1">
                <FormField
                  label={`Reference ${index + 1}`}
                  error={detailsErrors?.priorArt?.[index]?.message}
                >
                  <input
                    type="text"
                    {...register(`details.priorArt.${index}`)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </FormField>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePriorArt(index)}
                className="mt-8 text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-900">
            Declarations
          </h4>

          <div className="space-y-4">
            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  type="checkbox"
                  {...register('details.declarations.novelty')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  Declaration of Novelty
                </label>
                <p className="text-gray-500">
                  I declare that this invention is novel and has not been publicly disclosed.
                </p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  type="checkbox"
                  {...register('details.declarations.industrialApplicability')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  Declaration of Industrial Applicability
                </label>
                <p className="text-gray-500">
                  I declare that this invention is capable of industrial application.
                </p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  type="checkbox"
                  {...register('details.declarations.inventor')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  Inventor's Declaration
                </label>
                <p className="text-gray-500">
                  I declare that I am the true inventor of this invention.
                </p>
              </div>
            </div>
          </div>

          {detailsErrors?.declarations?.message && (
            <p className="text-sm text-red-600">
              {detailsErrors.declarations.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 