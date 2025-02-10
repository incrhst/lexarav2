import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export function useApplicationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const form = useForm({
    defaultValues: {
      // Common fields
      applicationType: '',
      applicationSubType: '',
      applicantName: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      applicantAddress: '',
      applicantCountry: '',
      
      // Payment fields
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      paymentAmount: 0,
      
      // Trademark specific fields
      trademarkName: '',
      trademarkDescription: '',
      goodsServicesClass: [],
      useStatus: '',
      territory: [],
      
      // Trademark filing specific fields
      oppositionGrounds: '',
      oppositionEvidence: null,
      renewalPeriod: '',
      previousRegistrationNumber: '',
      previousOwnerDetails: '',
      newOwnerDetails: '',
      nameAddressChangeDetails: '',
      powerOfAttorneyDocument: null,
      correctionDetails: '',
      counterStatementDetails: '',
      counterStatementEvidence: null,

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
      
      // Patent filing specific fields
      oppositionPatentGrounds: '',
      oppositionPatentEvidence: null,
      annualRenewalYear: '',
      licenseRequestDetails: '',
      licenseRequestJustification: '',
      patentOwnershipTransfer: '',
      patentNameAddressChange: '',
      patentPowerOfAttorney: null,
      patentCorrectionDetails: '',
    },
  });

  const processPayment = async (paymentData: any) => {
    // This is a mock payment processing function
    // In a real application, you would integrate with a payment provider like Stripe
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate payment processing
        if (paymentData.cardNumber && paymentData.expiryDate && paymentData.cvv) {
          resolve({
            success: true,
            transactionId: `TXN-${Math.random().toString(36).substr(2, 9)}`,
            amount: paymentData.paymentAmount,
            timestamp: new Date().toISOString(),
          });
        } else {
          reject(new Error('Invalid payment details'));
        }
      }, 1500);
    });
  };

  const generateReceipt = (paymentResult: any, applicationData: any) => {
    return {
      receiptNumber: `RCP-${Math.random().toString(36).substr(2, 9)}`,
      transactionId: paymentResult.transactionId,
      amount: paymentResult.amount,
      timestamp: paymentResult.timestamp,
      applicationType: applicationData.application_type,
      applicationSubType: applicationData.application_sub_type,
      applicantName: applicationData.applicant_name,
      applicantEmail: applicationData.contact_email,
    };
  };

  const handleSubmit = async (data: any) => {
    const applicationType = form.getValues('applicationType');
    const applicationSubType = form.getValues('applicationSubType');
    
    if (currentStep < getRequiredSteps(applicationType, applicationSubType)) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsLoading(true);
    try {
      // Process payment first
      const paymentResult = await processPayment({
        cardNumber: data.cardNumber,
        expiryDate: data.expiryDate,
        cvv: data.cvv,
        cardholderName: data.cardholderName,
        paymentAmount: data.paymentAmount,
      });

      const commonData = {
        applicant_id: user?.id,
        application_type: data.applicationType,
        application_sub_type: data.applicationSubType,
        status: 'submitted',
        applicant_name: data.applicantName,
        applicant_address: data.applicantAddress,
        applicant_country: data.applicantCountry,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
        payment_status: 'paid',
        payment_amount: data.paymentAmount,
        payment_transaction_id: paymentResult.transactionId,
        payment_timestamp: paymentResult.timestamp,
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
            // Additional fields based on sub-type
            opposition_grounds: data.oppositionGrounds,
            renewal_period: data.renewalPeriod,
            previous_registration_number: data.previousRegistrationNumber,
            previous_owner_details: data.previousOwnerDetails,
            new_owner_details: data.newOwnerDetails,
            name_address_change_details: data.nameAddressChangeDetails,
            correction_details: data.correctionDetails,
            counter_statement_details: data.counterStatementDetails,
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
            // Additional fields based on sub-type
            opposition_patent_grounds: data.oppositionPatentGrounds,
            annual_renewal_year: data.annualRenewalYear,
            license_request_details: data.licenseRequestDetails,
            license_request_justification: data.licenseRequestJustification,
            patent_ownership_transfer: data.patentOwnershipTransfer,
            patent_name_address_change: data.patentNameAddressChange,
            patent_correction_details: data.patentCorrectionDetails,
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
      }

      // Insert application data
      const { error } = await supabase
        .from('applications')
        .insert([applicationData]);

      if (error) throw error;

      // Generate receipt
      const receipt = generateReceipt(paymentResult, applicationData);

      // Store receipt in database
      await supabase
        .from('receipts')
        .insert([receipt]);

      navigate('/dashboard', { 
        state: { 
          message: 'Application submitted successfully',
          receipt: receipt,
        } 
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const getRequiredSteps = (type: string, subType: string) => {
    if (!type) return 2;

    // For new applications, use the original step count
    if (subType === 'new') {
      switch (type) {
        case 'trademark':
          return 5; // Including payment step
        case 'copyright':
        case 'patent':
          return 4; // Including payment step
        default:
          return 2;
      }
    }

    // For other filing types, we typically need fewer steps
    return 4; // Type selection, Applicant Info, Filing Details, and Payment
  };

  return {
    currentStep,
    form,
    isLoading,
    handleSubmit,
  };
} 