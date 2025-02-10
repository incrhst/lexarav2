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
  const applicationType = values.applicationType;

  const commonSections = [
    {
      title: 'Application Information',
      fields: [
        { label: 'Application Type', value: values.applicationType },
        { label: 'Filing Type', value: values.applicationSubType },
      ],
    },
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
      title: 'Payment Information',
      fields: [
        { label: 'Amount', value: `£${values.paymentAmount}` },
        { label: 'Card Number', value: `**** **** **** ${values.cardNumber.slice(-4)}` },
        { label: 'Cardholder Name', value: values.cardholderName },
      ],
    },
  ];

  const trademarkSections = [
    {
      title: 'IP Details',
      fields: [
        { label: 'Jurisdiction', value: values.trademarkJurisdiction === 'local' ? 'Local (National)' :
                                      values.trademarkJurisdiction === 'uk' ? 'United Kingdom (UK)' :
                                      values.trademarkJurisdiction === 'wipo' ? 'International (WIPO)' : '' },
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

  const copyrightSections = [
    {
      title: 'Work Information',
      fields: [
        { label: 'Title of Work', value: values.workTitle },
        { label: 'Type of Work', value: values.workType },
        { label: 'Creation Date', value: values.creationDate },
        { label: 'Publication Date', value: values.publicationDate },
        { label: 'Medium', value: values.medium },
        { label: 'Description', value: values.workDescription },
      ],
    },
    {
      title: 'Authorship Information',
      fields: [
        { label: 'Author Name(s)', value: values.authorNames },
        { label: 'Author Address', value: values.authorAddress },
        { label: 'Author Nationality', value: values.authorNationality },
        { label: 'Contribution Type', value: values.contributionType },
      ],
    },
    {
      title: 'Rights Holder Information',
      fields: [
        { label: 'Rights Holder Name(s)', value: values.rightsHolderNames },
        { label: 'Rights Holder Address', value: values.rightsHolderAddress },
        { label: 'Rights Holder Nationality', value: values.rightsHolderNationality },
      ],
    },
  ];

  const patentSections = [
    {
      title: 'Invention Information',
      fields: [
        { label: 'Title of Invention', value: values.inventionTitle },
        { label: 'Technical Field', value: values.technicalField },
        { label: 'Abstract', value: values.abstract },
        { label: 'Detailed Description', value: values.detailedDescription },
        { label: 'Claims', value: values.claims },
      ],
    },
    {
      title: 'Prior Art Information',
      fields: [
        { label: 'Prior Art References', value: values.priorArt },
        { label: 'Related Patent Numbers', value: values.relatedPatents },
        { label: 'Related Applications', value: values.relatedApplications },
      ],
    },
    {
      title: 'Filing Information',
      fields: [
        { label: 'Application Type', value: values.patentApplicationType },
        { label: 'Priority Claim', value: values.priorityClaim },
        { label: 'Previous Registration', value: values.previousRegistration },
      ],
    },
    {
      title: 'Declarations',
      fields: [
        { 
          label: 'Novelty Declaration', 
          value: values.noveltyDeclaration ? 'Confirmed' : 'Not Confirmed' 
        },
        { 
          label: 'Industrial Applicability', 
          value: values.industrialDeclaration ? 'Confirmed' : 'Not Confirmed' 
        },
        { 
          label: 'Inventor Declaration', 
          value: values.inventorDeclaration ? 'Confirmed' : 'Not Confirmed' 
        },
      ],
    },
  ];

  const getSections = () => {
    switch (applicationType) {
      case 'trademark':
        return [...commonSections, ...trademarkSections];
      case 'copyright':
        return [...commonSections, ...copyrightSections];
      case 'patent':
        return [...commonSections, ...patentSections];
      default:
        return commonSections;
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {getSections().map((section) => (
          <div key={section.title} className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {section.title}
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div 
                  key={field.label} 
                  className={
                    field.label === 'Description' || 
                    field.label === 'Abstract' || 
                    field.label === 'Detailed Description' || 
                    field.label === 'Claims' 
                      ? 'sm:col-span-2' 
                      : ''
                  }
                >
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