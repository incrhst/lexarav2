import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import StepActions from '../StepActions';

interface Props {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isLastStep: boolean;
}

export default function Review({
  form,
  onSubmit,
  onCancel,
  isLoading,
  isLastStep,
}: Props) {
  const { getValues } = form;
  const values = getValues();

  const sections = [
    {
      title: 'Applicant Information',
      fields: [
        { label: 'Full Name', value: values.applicantName },
        { label: 'Company Name', value: values.companyName },
        { label: 'Email', value: values.contactEmail },
        { label: 'Phone', value: values.contactPhone },
        { label: 'Address', value: values.applicantAddress },
        { label: 'Country', value: values.applicantCountry },
      ],
    },
    {
      title: 'Trademark Details',
      fields: [
        { label: 'Trademark Name', value: values.trademarkName },
        { label: 'Description', value: values.trademarkDescription },
        { label: 'Use Status', value: values.useStatus },
      ],
    },
    {
      title: 'Goods & Services',
      fields: [
        {
          label: 'Classes',
          value: values.goodsServicesClass?.join(', '),
        },
        {
          label: 'Territory',
          value: values.territory?.join(', '),
        },
      ],
    },
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {sections.map((section) => (
          <div key={section.title} className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {section.title}
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div key={field.label}>
                  <dt className="text-sm font-medium text-gray-500">
                    {field.label}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {field.value || '-'}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <StepActions
        onCancel={onCancel}
        isLoading={isLoading}
        isLastStep={isLastStep}
      />
    </form>
  );
}