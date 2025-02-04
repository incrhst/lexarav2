import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
import { ApplicationFormData, TrademarkDetails, CopyrightDetails, PatentDetails } from '../types';
import { applicationSchema } from '../schemas';
import { Database } from '../../../types/database';

const defaultTrademarkDetails: TrademarkDetails = {
  trademarkName: '',
  description: '',
  goodsServicesClass: [],
  useStatus: 'intentToUse',
  territory: [],
};

const defaultCopyrightDetails: CopyrightDetails = {
  workTitle: '',
  workType: 'literary',
  creationDate: new Date(),
  medium: 'book',
  authors: [],
};

const defaultPatentDetails: PatentDetails = {
  inventionTitle: '',
  technicalField: '',
  abstract: '',
  claims: [],
  priorArt: [],
  declarations: {
    novelty: false,
    industrialApplicability: false,
    inventor: false,
  },
};

export function useIPApplicationForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [applicationType, setApplicationType] = useState<ApplicationFormData['type']>('trademark');

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      type: 'trademark',
      applicantName: '',
      applicantAddress: '',
      applicantCountry: '',
      contactPhone: '',
      contactEmail: '',
      representative: '',
      attachments: [],
      details: defaultTrademarkDetails,
    },
  });

  const handleTypeChange = (type: ApplicationFormData['type']) => {
    setApplicationType(type);
    form.setValue('type', type);

    // Reset details based on type
    const details = type === 'trademark'
      ? defaultTrademarkDetails
      : type === 'copyright'
      ? defaultCopyrightDetails
      : defaultPatentDetails;

    form.setValue('details', details);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upload attachments first
      const attachmentUrls = await Promise.all(
        data.attachments.map(async (file) => {
          const fileName = `${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('logos')
            .upload(fileName, file.file);

          if (uploadError) {
            throw new Error(`Error uploading logo: ${uploadError.message}`);
          }

          return {
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size,
            status: 'completed' as const,
            url: uploadData.path,
            uploadProgress: 100,
          };
        })
      );

      // Create the application record
      const { data: application, error } = await supabase
        .from('applications')
        .insert({
          applicant_id: user.id,
          application_type: data.type,
          applicant_name: data.applicantName,
          applicant_address: data.applicantAddress,
          applicant_country: data.applicantCountry,
          contact_phone: data.contactPhone,
          contact_email: data.contactEmail,
          representative: data.representative || null,
          details: JSON.stringify(data.details),
          attachments: JSON.stringify(attachmentUrls),
          status: 'submitted',
          logo_url: data.type === 'trademark' && attachmentUrls.length > 0 ? attachmentUrls[0].url : null,
          trademark_name: data.type === 'trademark' ? (data.details as TrademarkDetails).trademarkName : null,
          trademark_description: data.type === 'trademark' ? (data.details as TrademarkDetails).description : null,
          goods_services_class: data.type === 'trademark' ? (data.details as TrademarkDetails).goodsServicesClass : null,
          use_status: data.type === 'trademark' ? (data.details as TrademarkDetails).useStatus : null,
          territory: data.type === 'trademark' ? (data.details as TrademarkDetails).territory : null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error submitting application: ${error.message}`);
      }

      // Navigate to the application details page
      navigate(`/applications/${application.id}`);
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  });

  return {
    form,
    isLoading,
    applicationType,
    handleTypeChange,
    handleSubmit,
  };
} 