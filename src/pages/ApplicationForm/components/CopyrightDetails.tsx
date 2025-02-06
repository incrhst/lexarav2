import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { ApplicationFormData, CopyrightDetails as CopyrightDetailsType } from '../types';
import FormField from '../../../components/FormField';
import { PlusCircle, XCircle } from 'lucide-react';

interface Props {
  form: UseFormReturn<ApplicationFormData>;
}

export default function CopyrightDetails({ form }: Props) {
  const { register, formState: { errors }, watch } = form;
  const details = watch('details') as CopyrightDetailsType;
  const detailsErrors = errors.details as any;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'details.authors',
  });

  if (form.watch('type') !== 'copyright') return null;

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">
          Copyright Details
        </h3>

        <FormField
          label="Title of Work"
          error={detailsErrors?.workTitle?.message}
        >
          <input
            type="text"
            {...register('details.workTitle')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </FormField>

        <FormField
          label="Type of Work"
          error={detailsErrors?.workType?.message}
        >
          <select
            {...register('details.workType')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="literary">Literary Work</option>
            <option value="artistic">Artistic Work</option>
            <option value="musical">Musical Work</option>
          </select>
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Date of Creation"
            error={detailsErrors?.creationDate?.message}
          >
            <input
              type="date"
              {...register('details.creationDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </FormField>

          <FormField
            label="Date of Publication (Optional)"
            error={detailsErrors?.publicationDate?.message}
          >
            <input
              type="date"
              {...register('details.publicationDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </FormField>
        </div>

        <FormField
          label="Medium"
          error={detailsErrors?.medium?.message}
        >
          <select
            {...register('details.medium')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="book">Book</option>
            <option value="painting">Painting</option>
            <option value="music">Music</option>
          </select>
        </FormField>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-base font-medium text-gray-900">
              Authors
            </h4>
            <button
              type="button"
              onClick={() => append({
                name: '',
                nationality: '',
                contributionType: 'sole',
              })}
              className="inline-flex items-center text-sm text-primary hover:text-primary-dark"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Author
            </button>
          </div>

          {detailsErrors?.authors?.message && (
            <p className="text-sm text-red-600">
              {detailsErrors.authors.message}
            </p>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 bg-gray-50 rounded-lg space-y-4"
            >
              <div className="flex justify-between items-start">
                <h5 className="text-sm font-medium text-gray-900">
                  Author {index + 1}
                </h5>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="Name"
                  error={detailsErrors?.authors?.[index]?.name?.message}
                >
                  <input
                    type="text"
                    {...register(`details.authors.${index}.name`)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </FormField>

                <FormField
                  label="Nationality"
                  error={detailsErrors?.authors?.[index]?.nationality?.message}
                >
                  <input
                    type="text"
                    {...register(`details.authors.${index}.nationality`)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </FormField>
              </div>

              <FormField
                label="Contribution Type"
                error={detailsErrors?.authors?.[index]?.contributionType?.message}
              >
                <select
                  {...register(`details.authors.${index}.contributionType`)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="sole">Sole Author</option>
                  <option value="co-author">Co-Author</option>
                </select>
              </FormField>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 