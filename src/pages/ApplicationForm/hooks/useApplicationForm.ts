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
      applicantName: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      applicantAddress: '',
      applicantCountry: '',
      trademarkName: '',
      trademarkDescription: '',
      goodsServicesClass: [],
      useStatus: 'intentToUse',
      territory: [],
    },
  });

  const handleSubmit = async (data: any) => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('applications').insert({
        applicant_id: user?.id,
        application_type: 'trademark',
        status: 'submitted',
        applicant_name: data.applicantName,
        applicant_address: data.applicantAddress,
        applicant_country: data.applicantCountry,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
        trademark_name: data.trademarkName,
        trademark_description: data.trademarkDescription,
        goods_services_class: data.goodsServicesClass,
        use_status: data.useStatus,
        territory: data.territory,
      });

      if (error) throw error;
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