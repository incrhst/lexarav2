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

export default function PatentDetails({
  form,
  onSubmit,
  onCancel,
  isLoading,
  isLastStep,
}: Props) {
  const { register, formState: { errors } } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Invention Information */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Invention Information</h3>
        
        <FormField
          label="Title of Invention"
          error={errors.inventionTitle?.message}
        >
          <input
            type="text"
            {...register('inventionTitle', { required: 'Title is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </FormField>

        <FormField
          label="Technical Field"
          error={errors.technicalField?.message}
        >
          <input
            type="text"
            {...register('technicalField', { required: 'Technical field is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </FormField>

        <FormField
          label="Abstract"
          error={errors.abstract?.message}
        >
          <textarea
            {...register('abstract', {
              required: 'Abstract is required',
              minLength: {
                value: 100,
                message: 'Abstract must be at least 100 characters',
              },
            })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Provide a brief summary of your invention..."
          />
        </FormField>

        <FormField
          label="Detailed Description"
          error={errors.detailedDescription?.message}
        >
          <textarea
            {...register('detailedDescription', {
              required: 'Detailed description is required',
              minLength: {
                value: 500,
                message: 'Description must be at least 500 characters',
              },
            })}
            rows={8}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Provide a comprehensive description of your invention..."
          />
        </FormField>

        <FormField
          label="Claims"
          error={errors.claims?.message}
        >
          <textarea
            {...register('claims', {
              required: 'Claims are required',
            })}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="List your specific claims for protection..."
          />
        </FormField>

        <FormField
          label="Diagrams/Drawings"
          optional
          error={errors.drawings?.message}
        >
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="text-sm text-gray-600">
                <label
                  htmlFor="drawings"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload diagrams</span>
                  <input
                    id="drawings"
                    type="file"
                    multiple
                    className="sr-only"
                    accept="image/*,.pdf"
                    {...register('drawings')}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB each</p>
            </div>
          </div>
        </FormField>
      </div>

      {/* Prior Art Information */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Prior Art Information</h3>
        
        <FormField
          label="Prior Art References"
          optional
          error={errors.priorArt?.message}
        >
          <textarea
            {...register('priorArt')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="List any related inventions or patents..."
          />
        </FormField>

        <FormField
          label="Related Patent Numbers"
          optional
          error={errors.relatedPatents?.message}
        >
          <input
            type="text"
            {...register('relatedPatents')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Comma-separated list of related patent numbers"
          />
        </FormField>

        <FormField
          label="Related Applications"
          optional
          error={errors.relatedApplications?.message}
        >
          <textarea
            {...register('relatedApplications')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="List any related foreign applications..."
          />
        </FormField>
      </div>

      {/* Filing Information */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Filing Information</h3>

        <FormField
          label="Application Type"
          error={errors.patentApplicationType?.message}
        >
          <select
            {...register('patentApplicationType', { required: 'Application type is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select type</option>
            <option value="provisional">Provisional</option>
            <option value="nonprovisional">Non-Provisional</option>
          </select>
        </FormField>

        <FormField
          label="Priority Claim"
          optional
          error={errors.priorityClaim?.message}
        >
          <input
            type="text"
            {...register('priorityClaim')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter priority claim details if applicable"
          />
        </FormField>

        <FormField
          label="Previous Registration"
          optional
          error={errors.previousRegistration?.message}
        >
          <input
            type="text"
            {...register('previousRegistration')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter previous registration details if applicable"
          />
        </FormField>
      </div>

      {/* Declarations */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Declarations</h3>

        <div className="space-y-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              {...register('noveltyDeclaration', { required: 'Novelty declaration is required' })}
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              I declare that this invention is novel and has not been publicly disclosed before the filing date
              {errors.noveltyDeclaration && (
                <span className="text-red-500 block">{errors.noveltyDeclaration.message}</span>
              )}
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              {...register('industrialDeclaration', { required: 'Industrial applicability declaration is required' })}
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              I declare that this invention is industrially applicable
              {errors.industrialDeclaration && (
                <span className="text-red-500 block">{errors.industrialDeclaration.message}</span>
              )}
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              {...register('inventorDeclaration', { required: 'Inventor declaration is required' })}
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              I declare that I am the inventor or have the right to file this application
              {errors.inventorDeclaration && (
                <span className="text-red-500 block">{errors.inventorDeclaration.message}</span>
              )}
            </span>
          </label>
        </div>
      </div>

      {/* Supporting Documents */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Supporting Documents</h3>

        <FormField
          label="Technical Specifications"
          error={errors.technicalSpecs?.message}
        >
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="text-sm text-gray-600">
                <label
                  htmlFor="technicalSpecs"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload specifications</span>
                  <input
                    id="technicalSpecs"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx"
                    {...register('technicalSpecs', { required: 'Technical specifications are required' })}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PDF or DOC up to 50MB</p>
            </div>
          </div>
        </FormField>

        <FormField
          label="Inventor's Statement"
          error={errors.inventorStatement?.message}
        >
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="text-sm text-gray-600">
                <label
                  htmlFor="inventorStatement"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload statement</span>
                  <input
                    id="inventorStatement"
                    type="file"
                    className="sr-only"
                    accept=".pdf"
                    {...register('inventorStatement', { required: 'Inventor statement is required' })}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PDF up to 10MB</p>
            </div>
          </div>
        </FormField>

        <FormField
          label="Power of Attorney"
          optional
          error={errors.powerOfAttorney?.message}
        >
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="text-sm text-gray-600">
                <label
                  htmlFor="powerOfAttorney"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload document</span>
                  <input
                    id="powerOfAttorney"
                    type="file"
                    className="sr-only"
                    accept=".pdf"
                    {...register('powerOfAttorney')}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PDF up to 10MB</p>
            </div>
          </div>
        </FormField>
      </div>

      <StepActions
        onCancel={onCancel}
        isLoading={isLoading}
        isLastStep={isLastStep}
      />
    </form>
  );
} 