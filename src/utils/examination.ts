import { z } from 'zod';

// Examination Status Types
export type ExaminationStatus =
  | 'pending_review'
  | 'under_examination'
  | 'office_action'
  | 'response_required'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export type GazetteStatus =
  | 'pending_publication'
  | 'published'
  | 'opposition_period'
  | 'opposition_filed'
  | 'registered';

export type OppositionStatus =
  | 'draft'
  | 'filed'
  | 'under_review'
  | 'response_required'
  | 'hearing_scheduled'
  | 'decided'
  | 'appealed';

// Checklist Schema
export const checklistSchema = z.object({
  formalRequirements: z.object({
    completed: z.boolean(),
    items: z.array(z.object({
      id: z.string(),
      description: z.string(),
      status: z.enum(['pending', 'passed', 'failed']),
      notes: z.string().optional(),
    })),
  }),
  substantiveExamination: z.object({
    completed: z.boolean(),
    items: z.array(z.object({
      id: z.string(),
      description: z.string(),
      status: z.enum(['pending', 'passed', 'failed']),
      notes: z.string().optional(),
    })),
  }),
  classification: z.object({
    completed: z.boolean(),
    items: z.array(z.object({
      id: z.string(),
      description: z.string(),
      status: z.enum(['pending', 'passed', 'failed']),
      notes: z.string().optional(),
    })),
  }),
});

// Examination Record Schema
export const examinationRecordSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  examinerId: z.string(),
  status: z.enum([
    'pending_review',
    'under_examination',
    'office_action',
    'response_required',
    'approved',
    'rejected',
    'withdrawn',
  ]),
  checklist: checklistSchema,
  decision: z.object({
    outcome: z.enum(['approved', 'rejected', 'office_action']).optional(),
    reason: z.string().optional(),
    date: z.string().optional(),
  }),
  notes: z.array(z.object({
    id: z.string(),
    examinerId: z.string(),
    content: z.string(),
    timestamp: z.string(),
    type: z.enum(['internal', 'official']),
  })),
  timeline: z.array(z.object({
    id: z.string(),
    action: z.string(),
    timestamp: z.string(),
    actor: z.string(),
    details: z.string().optional(),
  })),
  officeActions: z.array(z.object({
    id: z.string(),
    type: z.string(),
    content: z.string(),
    issuedDate: z.string(),
    dueDate: z.string(),
    status: z.enum(['pending', 'responded', 'expired']),
  })),
  created_at: z.string(),
  updated_at: z.string(),
});

// Gazette Record Schema
export const gazetteRecordSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  status: z.enum([
    'pending_publication',
    'published',
    'opposition_period',
    'opposition_filed',
    'registered',
  ]),
  publicationDetails: z.object({
    gazetteNumber: z.string(),
    publicationDate: z.string(),
    section: z.string(),
    pageNumber: z.string().optional(),
  }).optional(),
  oppositionPeriod: z.object({
    startDate: z.string(),
    endDate: z.string(),
    status: z.enum(['pending', 'active', 'completed', 'extended']),
  }).optional(),
  notifications: z.array(z.object({
    id: z.string(),
    type: z.string(),
    content: z.string(),
    sentDate: z.string(),
    status: z.enum(['pending', 'sent', 'failed']),
  })),
});

// Opposition Record Schema
export const oppositionRecordSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  opposerId: z.string(),
  status: z.enum([
    'draft',
    'filed',
    'under_review',
    'response_required',
    'hearing_scheduled',
    'decided',
    'appealed',
  ]),
  grounds: z.array(z.object({
    id: z.string(),
    category: z.string(),
    description: z.string(),
    evidence: z.array(z.object({
      id: z.string(),
      type: z.string(),
      filename: z.string(),
      uploadDate: z.string(),
      status: z.enum(['pending', 'verified', 'rejected']),
    })),
  })),
  timeline: z.array(z.object({
    id: z.string(),
    event: z.string(),
    date: z.string(),
    notes: z.string().optional(),
  })),
  decisions: z.array(z.object({
    id: z.string(),
    type: z.enum(['interim', 'final']),
    outcome: z.enum(['upheld', 'rejected', 'partial']),
    reason: z.string(),
    date: z.string(),
    issuedBy: z.string(),
  })),
  hearings: z.array(z.object({
    id: z.string(),
    scheduledDate: z.string(),
    type: z.enum(['preliminary', 'main', 'review']),
    status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled']),
    notes: z.string().optional(),
  })),
});

// Default Checklist Items
export const defaultChecklistItems = {
  formalRequirements: [
    { id: 'form_1', description: 'Application form completeness', status: 'pending' },
    { id: 'form_2', description: 'Required documents submitted', status: 'pending' },
    { id: 'form_3', description: 'Fees paid', status: 'pending' },
    { id: 'form_4', description: 'Power of attorney', status: 'pending' },
  ],
  substantiveExamination: [
    { id: 'subst_1', description: 'Distinctiveness check', status: 'pending' },
    { id: 'subst_2', description: 'Similarity search', status: 'pending' },
    { id: 'subst_3', description: 'Absolute grounds', status: 'pending' },
    { id: 'subst_4', description: 'Relative grounds', status: 'pending' },
  ],
  classification: [
    { id: 'class_1', description: 'Nice Classification accuracy', status: 'pending' },
    { id: 'class_2', description: 'Specification clarity', status: 'pending' },
    { id: 'class_3', description: 'Class scope appropriateness', status: 'pending' },
  ],
};

// Helper Functions
export const createExaminationRecord = (applicationId: string, examinerId: string) => {
  return {
    id: crypto.randomUUID(),
    applicationId,
    examinerId,
    status: 'pending_review' as ExaminationStatus,
    checklist: {
      formalRequirements: {
        completed: false,
        items: [...defaultChecklistItems.formalRequirements],
      },
      substantiveExamination: {
        completed: false,
        items: [...defaultChecklistItems.substantiveExamination],
      },
      classification: {
        completed: false,
        items: [...defaultChecklistItems.classification],
      },
    },
    decision: {},
    notes: [],
    timeline: [{
      id: crypto.randomUUID(),
      action: 'Examination started',
      timestamp: new Date().toISOString(),
      actor: examinerId,
    }],
    officeActions: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const createGazetteRecord = (applicationId: string) => {
  return {
    id: crypto.randomUUID(),
    applicationId,
    status: 'pending_publication' as GazetteStatus,
    notifications: [],
  };
};

export const createOppositionRecord = (applicationId: string, opposerId: string) => {
  return {
    id: crypto.randomUUID(),
    applicationId,
    opposerId,
    status: 'draft' as OppositionStatus,
    grounds: [],
    timeline: [{
      id: crypto.randomUUID(),
      event: 'Opposition initiated',
      date: new Date().toISOString(),
    }],
    decisions: [],
    hearings: [],
  };
};

// Timeline Helpers
export const addTimelineEvent = (
  timeline: z.infer<typeof examinationRecordSchema>['timeline'],
  action: string,
  actor: string,
  details?: string
) => {
  return [
    ...timeline,
    {
      id: crypto.randomUUID(),
      action,
      timestamp: new Date().toISOString(),
      actor,
      details,
    },
  ];
};

// Note Helpers
export const addNote = (
  notes: z.infer<typeof examinationRecordSchema>['notes'],
  content: string,
  examinerId: string,
  type: 'internal' | 'official' = 'internal'
) => {
  return [
    ...notes,
    {
      id: crypto.randomUUID(),
      examinerId,
      content,
      timestamp: new Date().toISOString(),
      type,
    },
  ];
}; 