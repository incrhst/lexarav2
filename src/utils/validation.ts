import { z } from 'zod';

// Nice Classification data structure
export const niceClassifications = {
  1: { description: 'Chemicals', examples: ['chemicals', 'raw materials'] },
  2: { description: 'Paints', examples: ['paints', 'varnishes'] },
  // ... add all 45 classes
} as const;

// Supported file types and their validation rules
export const supportedFileTypes = {
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif'],
    maxSize: 5 * 1024 * 1024, // 5MB
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
  },
  document: {
    extensions: ['.pdf', '.doc', '.docx'],
    maxSize: 10 * 1024 * 1024, // 10MB
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
} as const;

// Jurisdiction-specific validation rules
export const jurisdictionRules = {
  US: {
    requiresLocalAddress: true,
    maxClassesPerApplication: 45,
    allowsMultipleClasses: true,
    documentRequirements: ['proofOfUse', 'powerOfAttorney'],
  },
  EU: {
    requiresLocalAddress: false,
    maxClassesPerApplication: 45,
    allowsMultipleClasses: true,
    documentRequirements: ['powerOfAttorney'],
  },
  // Add more jurisdictions as needed
} as const;

// Base schemas for common fields
const contactSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
});

// File validation schema
const fileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
});

// Nice classification schema
const niceClassificationSchema = z.object({
  classNumber: z.number().min(1).max(45),
  specification: z.string().min(1, 'Specification is required'),
  goods: z.array(z.string()),
  services: z.array(z.string()),
});

// Main application schema
export const applicationSchema = z.object({
  // Basic Information
  type: z.enum(['trademark', 'patent']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  reference: z.string().optional(),
  
  // Applicant Information
  applicant: z.object({
    name: z.string().min(1, 'Applicant name is required'),
    type: z.enum(['individual', 'company']),
    contact: contactSchema,
  }),

  // Representative Information (if applicable)
  representative: z.object({
    name: z.string().min(1, 'Representative name is required'),
    contact: contactSchema,
  }).optional(),

  // Jurisdiction and Classification
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  classifications: z.array(niceClassificationSchema),

  // Documents
  documents: z.array(fileSchema),
});

// Validation helper functions
export const validateFile = (
  file: File,
  type: keyof typeof supportedFileTypes
): { valid: boolean; error?: string } => {
  const rules = supportedFileTypes[type];
  
  if (!rules.mimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Supported types: ${rules.extensions.join(', ')}`,
    };
  }

  if (file.size > rules.maxSize) {
    return {
      valid: false,
      error: `File size exceeds limit of ${rules.maxSize / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
};

export const validateClassification = (
  classification: z.infer<typeof niceClassificationSchema>,
  jurisdiction: keyof typeof jurisdictionRules
): { valid: boolean; error?: string } => {
  const rules = jurisdictionRules[jurisdiction];

  if (!rules) {
    return { valid: false, error: 'Unsupported jurisdiction' };
  }

  // Add jurisdiction-specific validation logic here
  return { valid: true };
};

// Fee calculation helper
export const calculateFees = (
  application: z.infer<typeof applicationSchema>
): { total: number; breakdown: Record<string, number> } => {
  const breakdown: Record<string, number> = {};
  let total = 0;

  // Base fee
  breakdown.baseFee = 100;
  total += breakdown.baseFee;

  // Per-class fee
  const classCount = application.classifications.length;
  breakdown.classFees = classCount * 50;
  total += breakdown.classFees;

  // Jurisdiction-specific fees
  const jurisdictionFee = 75; // This would vary by jurisdiction
  breakdown.jurisdictionFee = jurisdictionFee;
  total += jurisdictionFee;

  return { total, breakdown };
};

// Real-time validation helper
export const validateField = async (
  field: string,
  value: any,
  context: Partial<z.infer<typeof applicationSchema>> = {}
): Promise<{ valid: boolean; error?: string }> => {
  try {
    const fieldSchema = applicationSchema.shape[field as keyof typeof applicationSchema.shape];
    await fieldSchema.parseAsync(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Validation failed' };
  }
};

// Form-level validation
export const validateForm = async (
  data: Partial<z.infer<typeof applicationSchema>>
): Promise<{ valid: boolean; errors?: Record<string, string> }> => {
  try {
    await applicationSchema.parseAsync(data);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { form: 'Validation failed' } };
  }
}; 