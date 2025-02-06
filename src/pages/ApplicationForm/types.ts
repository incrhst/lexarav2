import { FileUploadValue } from '../../components/FileUpload';

export type ApplicationType = 'trademark' | 'copyright' | 'patent';
export type ApplicationStatus = 'submitted' | 'underReview' | 'published' | 'opposed' | 'allowed' | 'registered' | 'rejected';

// Base application fields that are common to all types
export interface BaseApplication {
  id?: string;
  type: ApplicationType;
  applicantName: string;
  applicantAddress: string;
  applicantCountry: string;
  contactPhone: string;
  contactEmail: string;
  representative?: string;
  filingDate: Date;
  filingNumber: string;
  status: ApplicationStatus;
  attachments: FileUploadValue[];
}

// Trademark specific fields
export interface TrademarkDetails {
  trademarkName: string;
  logo?: FileUploadValue;
  description: string;
  goodsServicesClass: number[];
  useStatus: 'inUse' | 'intentToUse';
  territory: string[];
}

// Copyright specific fields
export interface CopyrightDetails {
  workTitle: string;
  workType: 'literary' | 'artistic' | 'musical';
  creationDate: Date;
  publicationDate?: Date;
  medium: 'book' | 'painting' | 'music';
  authors: {
    name: string;
    nationality: string;
    contributionType: 'sole' | 'co-author';
  }[];
}

// Patent specific fields
export interface PatentDetails {
  inventionTitle: string;
  technicalField: string;
  abstract: string;
  claims: string[];
  priorArt: string[];
  declarations: {
    novelty: boolean;
    industrialApplicability: boolean;
    inventor: boolean;
  };
}

// Combined type for all application types
export type IPApplication = BaseApplication & (
  | { type: 'trademark'; details: TrademarkDetails }
  | { type: 'copyright'; details: CopyrightDetails }
  | { type: 'patent'; details: PatentDetails }
);

// Form data type for all fields
export type ApplicationFormData = Omit<IPApplication, 'id' | 'filingDate' | 'filingNumber' | 'status'>; 