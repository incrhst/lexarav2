import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';

export function useApplicationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const form = useForm({
    defaultValues: {
      // Common fields
      applicationType: '',
      applicantName: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      applicantAddress: '',
      applicantCountry: '',
      
      // Trademark specific fields
      trademarkName: '',
      trademarkDescription: '',
      goodsServicesClass: [],
      useStatus: '',
      territory: [],
      
      // Copyright specific fields
      workTitle: '',
      workType: '',
      creationDate: '',
      publicationDate: '',
      medium: '',
      workDescription: '',
      authorNames: '',
      authorAddress: '',
      authorNationality: '',
      contributionType: '',
      rightsHolderNames: '',
      rightsHolderAddress: '',
      rightsHolderNationality: '',

      // Patent specific fields
      inventionTitle: '',
      technicalField: '',
      abstract: '',
      detailedDescription: '',
      claims: '',
      drawings: null,
      priorArt: '',
      relatedPatents: '',
      relatedApplications: '',
      patentApplicationType: '',
      priorityClaim: '',
      previousRegistration: '',
      noveltyDeclaration: false,
      industrialDeclaration: false,
      inventorDeclaration: false,
      technicalSpecs: null,
      inventorStatement: null,
      powerOfAttorney: null,
    },
  });

  const handleSubmit = async (data: any) => {
    const applicationType = form.getValues('applicationType');
    
    if (currentStep < (applicationType === 'trademark' ? 4 : 3)) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsLoading(true);
    try {
      const commonData = {
        applicant_id: user?.id,
        application_type: data.applicationType,
        status: 'submitted',
        applicant_name: data.applicantName,
        applicant_address: data.applicantAddress,
        applicant_country: data.applicantCountry,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
      };

      let applicationData;
      
      switch (data.applicationType) {
        case 'trademark':
          applicationData = {
            ...commonData,
            trademark_name: data.trademarkName,
            trademark_description: data.trademarkDescription,
            goods_services_class: data.goodsServicesClass,
            use_status: data.useStatus,
            territory: data.territory,
          };
          break;

        case 'copyright':
          applicationData = {
            ...commonData,
            work_title: data.workTitle,
            work_type: data.workType,
            creation_date: data.creationDate,
            publication_date: data.publicationDate,
            medium: data.medium,
            work_description: data.workDescription,
            author_names: data.authorNames,
            author_address: data.authorAddress,
            author_nationality: data.authorNationality,
            contribution_type: data.contributionType,
            rights_holder_names: data.rightsHolderNames,
            rights_holder_address: data.rightsHolderAddress,
            rights_holder_nationality: data.rightsHolderNationality,
          };
          break;

        case 'patent':
          applicationData = {
            ...commonData,
            invention_title: data.inventionTitle,
            technical_field: data.technicalField,
            abstract: data.abstract,
            detailed_description: data.detailedDescription,
            claims: data.claims,
            prior_art: data.priorArt,
            related_patents: data.relatedPatents,
            related_applications: data.relatedApplications,
            patent_application_type: data.patentApplicationType,
            priority_claim: data.priorityClaim,
            previous_registration: data.previousRegistration,
            novelty_declaration: data.noveltyDeclaration,
            industrial_declaration: data.industrialDeclaration,
            inventor_declaration: data.inventorDeclaration,
          };
          break;

        default:
          throw new Error('Invalid application type');
      }

      // First insert the application data
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert(applicationData)
        .select()
        .single();

      if (applicationError) throw applicationError;

      // Then handle file uploads if any
      if (application) {
        const uploadPromises = [];
        const fileFields = {
          trademark: ['logo'],
          copyright: ['workCopy', 'authorAffidavit'],
          patent: ['drawings', 'technicalSpecs', 'inventorStatement', 'powerOfAttorney'],
        };

        const files = fileFields[data.applicationType as keyof typeof fileFields];
        for (const field of files) {
          const file = data[field];
          if (file && file[0]) {
            const fileExt = file[0].name.split('.').pop();
            const fileName = `${application.id}/${field}.${fileExt}`;
            uploadPromises.push(
              supabase.storage
                .from('application-files')
                .upload(fileName, file[0])
            );
          }
        }

        if (uploadPromises.length > 0) {
          const uploadResults = await Promise.all(uploadPromises);
          const uploadErrors = uploadResults.filter(result => result.error);
          if (uploadErrors.length > 0) {
            console.error('Some files failed to upload:', uploadErrors);
          }
        }
      }

      navigate('/');
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentStep,
    form,
    isLoading,
    handleSubmit,
  };
}