import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { applicationSchema, validateField, validateForm, validateFile, calculateFees } from '../utils/validation';

type ValidationState = {
  [K in keyof z.infer<typeof applicationSchema>]?: {
    valid: boolean;
    error?: string;
    touched: boolean;
  };
};

export function useFormValidation() {
  const [formData, setFormData] = useState<Partial<z.infer<typeof applicationSchema>>>({});
  const [validationState, setValidationState] = useState<ValidationState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fees, setFees] = useState<{ total: number; breakdown: Record<string, number> }>({
    total: 0,
    breakdown: {},
  });

  // Update form data and trigger validation
  const updateField = useCallback(async (
    field: keyof z.infer<typeof applicationSchema>,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Mark field as touched
    setValidationState((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched: true,
      },
    }));

    // Validate the field
    const result = await validateField(field, value, formData);
    setValidationState((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        valid: result.valid,
        error: result.error,
        touched: true,
      },
    }));
  }, [formData]);

  // Handle file uploads with validation
  const handleFileUpload = useCallback(async (
    files: FileList,
    type: 'image' | 'document'
  ) => {
    const validatedFiles: File[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file, type);

      if (validation.valid) {
        validatedFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    setFormData((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), ...validatedFiles],
    }));

    return { validatedFiles, errors };
  }, []);

  // Validate entire form
  const validateEntireForm = useCallback(async () => {
    const result = await validateForm(formData);
    
    if (!result.valid && result.errors) {
      // Update validation state for each field with errors
      const newValidationState: ValidationState = {};
      Object.entries(result.errors).forEach(([path, error]) => {
        const field = path.split('.')[0] as keyof z.infer<typeof applicationSchema>;
        newValidationState[field] = {
          valid: false,
          error,
          touched: true,
        };
      });
      setValidationState((prev) => ({
        ...prev,
        ...newValidationState,
      }));
    }

    return result;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const validationResult = await validateEntireForm();

    if (!validationResult.valid) {
      setIsSubmitting(false);
      return { success: false, errors: validationResult.errors };
    }

    // Calculate final fees
    const finalFees = calculateFees(formData as z.infer<typeof applicationSchema>);
    setFees(finalFees);

    setIsSubmitting(false);
    return { success: true, data: formData, fees: finalFees };
  }, [formData, validateEntireForm]);

  // Update fees whenever relevant fields change
  useEffect(() => {
    if (formData.type && formData.classifications) {
      const newFees = calculateFees(formData as z.infer<typeof applicationSchema>);
      setFees(newFees);
    }
  }, [formData.type, formData.classifications]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({});
    setValidationState({});
    setFees({ total: 0, breakdown: {} });
  }, []);

  // Get field error message
  const getFieldError = useCallback((field: keyof z.infer<typeof applicationSchema>) => {
    const fieldState = validationState[field];
    return fieldState?.touched && !fieldState?.valid ? fieldState?.error : undefined;
  }, [validationState]);

  // Check if field is valid
  const isFieldValid = useCallback((field: keyof z.infer<typeof applicationSchema>) => {
    const fieldState = validationState[field];
    return fieldState?.touched && fieldState?.valid;
  }, [validationState]);

  return {
    formData,
    updateField,
    handleFileUpload,
    handleSubmit,
    resetForm,
    getFieldError,
    isFieldValid,
    isSubmitting,
    fees,
    validationState,
  };
} 