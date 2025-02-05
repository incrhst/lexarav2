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

export default function CopyrightDetails({
  form,
  onSubmit,
  onCancel,
  isLoading,
  isLastStep,
}: Props) {
  const { register, formState: { errors }, watch } = form;
  const isWorkForHire = watch('workForHire');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Work Information */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Work Information</h3>
        
        <FormField
          label="Title of Work"
          error={errors.workTitle?.message}
        >
          <input
            type="text"
            {...register('workTitle', { required: 'Title is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter the title of your work"
          />
        </FormField>

        <FormField
          label="Type of Work"
          error={errors.workType?.message}
        >
          <select
            {...register('workType', { required: 'Work type is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select type</option>
            <option value="literary">Literary Work</option>
            <option value="musical">Musical Work</option>
            <option value="dramatic">Dramatic Work</option>
            <option value="artistic">Artistic Work</option>
            <option value="audiovisual">Audiovisual Work</option>
            <option value="architectural">Architectural Work</option>
            <option value="choreographic">Choreographic Work</option>
            <option value="software">Computer Software</option>
          </select>
        </FormField>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            label="Creation Date"
            error={errors.creationDate?.message}
          >
            <input
              type="date"
              {...register('creationDate', { required: 'Creation date is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </FormField>

          <FormField
            label="Publication Status"
            error={errors.publicationStatus?.message}
          >
            <select
              {...register('publicationStatus', { required: 'Publication status is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </FormField>
        </div>

        {watch('publicationStatus') === 'published' && (
          <FormField
            label="Publication Date"
            error={errors.publicationDate?.message}
          >
            <input
              type="date"
              {...register('publicationDate', { required: 'Publication date is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </FormField>
        )}

        <FormField
          label="Description"
          error={errors.workDescription?.message}
        >
          <textarea
            {...register('workDescription', {
              required: 'Description is required',
              minLength: {
                value: 50,
                message: 'Description must be at least 50 characters',
              },
            })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Provide a detailed description of your work..."
          />
        </FormField>

        <FormField
          label="Work-for-Hire Status"
          error={errors.workForHire?.message}
        >
          <div className="mt-1 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('workForHire', { required: 'Please select work-for-hire status' })}
                value="yes"
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Yes, this is a work made for hire</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('workForHire', { required: 'Please select work-for-hire status' })}
                value="no"
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">No, this is not a work made for hire</span>
            </label>
          </div>
        </FormField>

        <FormField
          label="Derivative Work Status"
          error={errors.derivativeWork?.message}
        >
          <div className="mt-1 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('derivativeWork', { required: 'Please select derivative work status' })}
                value="yes"
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Yes, this is a derivative work</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register('derivativeWork', { required: 'Please select derivative work status' })}
                value="no"
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">No, this is an original work</span>
            </label>
          </div>
        </FormField>

        {watch('derivativeWork') === 'yes' && (
          <FormField
            label="Original Work Details"
            error={errors.originalWorkDetails?.message}
          >
            <textarea
              {...register('originalWorkDetails', { required: 'Original work details are required' })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe the original work this is derived from..."
            />
          </FormField>
        )}
      </div>

      {/* Author Information */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Author Information</h3>

        {!isWorkForHire && (
          <>
            <FormField
              label="Author Name(s)"
              error={errors.authorNames?.message}
            >
              <input
                type="text"
                {...register('authorNames', { required: 'Author name(s) required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter author name(s), separate multiple authors with commas"
              />
            </FormField>

            <FormField
              label="Author Address"
              error={errors.authorAddress?.message}
            >
              <textarea
                {...register('authorAddress', { required: 'Author address is required' })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter author's address"
              />
            </FormField>

            <FormField
              label="Author Nationality/Domicile"
              error={errors.authorNationality?.message}
            >
              <input
                type="text"
                {...register('authorNationality', { required: 'Author nationality is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter author's nationality or country of domicile"
              />
            </FormField>
          </>
        )}

        {isWorkForHire === 'yes' && (
          <>
            <FormField
              label="Employer/Commissioning Party"
              error={errors.employerName?.message}
            >
              <input
                type="text"
                {...register('employerName', { required: 'Employer name is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter employer or commissioning party name"
              />
            </FormField>

            <FormField
              label="Employer Address"
              error={errors.employerAddress?.message}
            >
              <textarea
                {...register('employerAddress', { required: 'Employer address is required' })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter employer's address"
              />
            </FormField>
          </>
        )}
      </div>

      {/* Supporting Documents */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Supporting Documents</h3>

        <FormField
          label="Copy of Work"
          error={errors.workCopy?.message}
        >
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="text-sm text-gray-600">
                <label
                  htmlFor="workCopy"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload work file</span>
                  <input
                    id="workCopy"
                    type="file"
                    className="sr-only"
                    {...register('workCopy', { required: 'Copy of work is required' })}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PDF, DOC, or media files up to 50MB</p>
            </div>
          </div>
        </FormField>

        {isWorkForHire === 'yes' && (
          <FormField
            label="Work-for-Hire Agreement"
            error={errors.workForHireAgreement?.message}
          >
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="text-sm text-gray-600">
                  <label
                    htmlFor="workForHireAgreement"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload agreement</span>
                    <input
                      id="workForHireAgreement"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.doc,.docx"
                      {...register('workForHireAgreement', { required: 'Work-for-hire agreement is required' })}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PDF or DOC up to 10MB</p>
              </div>
            </div>
          </FormField>
        )}
      </div>

      <StepActions
        onCancel={onCancel}
        isLoading={isLoading}
        isLastStep={isLastStep}
      />
    </form>
  );
} 