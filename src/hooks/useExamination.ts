import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ExaminationStatus } from '../utils/examination';

interface ExaminationRecord {
  id: string;
  application_id: string;
  examiner_id: string;
  status: ExaminationStatus;
  checklist: {
    formalRequirements: {
      completed: boolean;
      items: Array<{
        id: string;
        description: string;
        status: 'pending' | 'passed' | 'failed';
        notes?: string;
      }>;
    };
    substantiveExamination: {
      completed: boolean;
      items: Array<{
        id: string;
        description: string;
        status: 'pending' | 'passed' | 'failed';
        notes?: string;
      }>;
    };
    classification: {
      completed: boolean;
      items: Array<{
        id: string;
        description: string;
        status: 'pending' | 'passed' | 'failed';
        notes?: string;
      }>;
    };
  };
  decision: {
    outcome?: 'approved' | 'rejected' | 'office_action';
    reason?: string;
    date?: string;
  };
  notes: Array<{
    id: string;
    examinerId: string;
    content: string;
    timestamp: string;
    type: 'internal' | 'official';
  }>;
  timeline: Array<{
    id: string;
    action: string;
    timestamp: string;
    actor: string;
    details?: string;
  }>;
  office_actions: Array<{
    id: string;
    type: string;
    content: string;
    issuedDate: string;
    dueDate: string;
    status: 'pending' | 'responded' | 'expired';
  }>;
}

interface UseExaminationReturn {
  loading: boolean;
  error: Error | null;
  examinationRecord: ExaminationRecord | null;
  updateChecklist: (
    section: keyof ExaminationRecord['checklist'],
    itemId: string,
    updates: { status?: 'pending' | 'passed' | 'failed'; notes?: string }
  ) => Promise<void>;
  addNote: (content: string, type: 'internal' | 'official') => Promise<void>;
  addOfficeAction: (type: string, content: string, dueDate: Date) => Promise<void>;
  updateStatus: (status: ExaminationStatus) => Promise<void>;
  makeDecision: (
    outcome: 'approved' | 'rejected' | 'office_action',
    reason: string
  ) => Promise<void>;
}

export function useExamination(applicationId: string): UseExaminationReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [examinationRecord, setExaminationRecord] = useState<ExaminationRecord | null>(null);

  useEffect(() => {
    const fetchExaminationRecord = async () => {
      try {
        setLoading(true);
        
        // First check if a record exists
        const { data: existingRecord, error: fetchError } = await supabase
          .from('examination_records')
          .select('*')
          .eq('application_id', applicationId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (existingRecord) {
          setExaminationRecord(existingRecord as ExaminationRecord);
        } else {
          // Create new record if none exists
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('No authenticated user');

          const { data: newRecord, error: createError } = await supabase
            .rpc('create_examination_record', {
              p_application_id: applicationId,
              p_examiner_id: user.id
            });

          if (createError) throw createError;
          setExaminationRecord(newRecord as ExaminationRecord);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchExaminationRecord();
  }, [applicationId]);

  const updateChecklist = async (
    section: keyof ExaminationRecord['checklist'],
    itemId: string,
    updates: { status?: 'pending' | 'passed' | 'failed'; notes?: string }
  ) => {
    if (!examinationRecord) return;

    try {
      const updatedChecklist = {
        ...examinationRecord.checklist,
        [section]: {
          ...examinationRecord.checklist[section],
          items: examinationRecord.checklist[section].items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          )
        }
      };

      const { data, error } = await supabase
        .rpc('update_examination_record', {
          p_record_id: examinationRecord.id,
          p_updates: {
            checklist: updatedChecklist
          }
        });

      if (error) throw error;
      setExaminationRecord(data as ExaminationRecord);
    } catch (err) {
      setError(err as Error);
    }
  };

  const addNote = async (content: string, type: 'internal' | 'official') => {
    if (!examinationRecord) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .rpc('add_examination_note', {
          p_record_id: examinationRecord.id,
          p_examiner_id: user.id,
          p_content: content,
          p_type: type
        });

      if (error) throw error;
      setExaminationRecord(data as ExaminationRecord);
    } catch (err) {
      setError(err as Error);
    }
  };

  const addOfficeAction = async (type: string, content: string, dueDate: Date) => {
    if (!examinationRecord) return;

    try {
      const { data, error } = await supabase
        .rpc('add_office_action', {
          p_record_id: examinationRecord.id,
          p_type: type,
          p_content: content,
          p_due_date: dueDate.toISOString()
        });

      if (error) throw error;
      setExaminationRecord(data as ExaminationRecord);
    } catch (err) {
      setError(err as Error);
    }
  };

  const updateStatus = async (status: ExaminationStatus) => {
    if (!examinationRecord) return;

    try {
      const { data, error } = await supabase
        .rpc('update_examination_record', {
          p_record_id: examinationRecord.id,
          p_updates: { status }
        });

      if (error) throw error;
      setExaminationRecord(data as ExaminationRecord);
    } catch (err) {
      setError(err as Error);
    }
  };

  const makeDecision = async (
    outcome: 'approved' | 'rejected' | 'office_action',
    reason: string
  ) => {
    if (!examinationRecord) return;

    try {
      const decision = {
        outcome,
        reason,
        date: new Date().toISOString()
      };

      const { data, error } = await supabase
        .rpc('update_examination_record', {
          p_record_id: examinationRecord.id,
          p_updates: {
            decision,
            status: outcome
          }
        });

      if (error) throw error;
      setExaminationRecord(data as ExaminationRecord);
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    loading,
    error,
    examinationRecord,
    updateChecklist,
    addNote,
    addOfficeAction,
    updateStatus,
    makeDecision
  };
} 