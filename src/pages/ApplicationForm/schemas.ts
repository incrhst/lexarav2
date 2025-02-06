import { z } from 'zod';

// Common fields validation schema (without type field)
export const baseApplicationSchema = z.object({
  applicantName: z.string().min(1, 'Full name is required'),
  applicantAddress: z.string().min(1, 'Address is required'),
  applicantCountry: z.string().min(1, 'Country is required'),
  contactPhone: z.string().min(1, 'Phone number is required'),
  contactEmail: z.string().email('Invalid email address'),
  representative: z.string().optional(),
  attachments: z.array(z.object({
    id: z.string(),
    file: z.instanceof(File),
    type: z.enum(['image', 'document']),
    name: z.string(),
    size: z.number(),
    uploadProgress: z.number(),
    status: z.enum(['uploading', 'completed', 'error']),
    url: z.string().optional(),
    previewUrl: z.string().optional(),
    errorMessage: z.string().optional(),
  })),
});

// Trademark validation schema
export const trademarkDetailsSchema = z.object({
  trademarkName: z.string().min(1, 'Trademark name is required'),
  logo: z.instanceof(File).optional(),
  description: z.string().min(1, 'Description is required'),
  goodsServicesClass: z.array(z.string()).min(1, 'Select at least one class'),
  useStatus: z.enum(['inUse', 'intentToUse']),
  territory: z.array(z.string()).min(1, 'Select at least one territory'),
});

// Copyright validation schema
export const copyrightDetailsSchema = z.object({
  workTitle: z.string().min(1, 'Title is required'),
  workType: z.enum(['literary', 'artistic', 'musical']),
  creationDate: z.date(),
  publicationDate: z.date().optional(),
  medium: z.enum(['book', 'painting', 'music']),
  authors: z.array(z.object({
    name: z.string().min(1, 'Author name is required'),
    nationality: z.string().min(1, 'Nationality is required'),
    contributionType: z.enum(['sole', 'co-author']),
  })).min(1, 'At least one author is required'),
});

// Patent validation schema
export const patentDetailsSchema = z.object({
  inventionTitle: z.string().min(1, 'Title is required'),
  technicalField: z.string().min(1, 'Technical field is required'),
  abstract: z.string().min(1, 'Abstract is required'),
  claims: z.array(z.string()).min(1, 'At least one claim is required'),
  priorArt: z.array(z.string()),
  declarations: z.object({
    novelty: z.boolean(),
    industrialApplicability: z.boolean(),
    inventor: z.boolean(),
  }),
});

// Combined schema that validates based on application type
export const applicationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('trademark'),
    ...baseApplicationSchema.shape,
    details: trademarkDetailsSchema,
  }),
  z.object({
    type: z.literal('copyright'),
    ...baseApplicationSchema.shape,
    details: copyrightDetailsSchema,
  }),
  z.object({
    type: z.literal('patent'),
    ...baseApplicationSchema.shape,
    details: patentDetailsSchema,
  }),
]); 