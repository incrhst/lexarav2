import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { useOppositions } from '../../hooks/useOppositions';
import Button from '../../components/Button';

interface FormData {
  application_id: string;
  grounds: string;
  filing_date: string;
  documents: string[];
}

const initialFormData: FormData = {
  application_id: '',
  grounds: '',
  filing_date: new Date().toISOString().split('T')[0],
  documents: [],
};

export default function OppositionForm() {
  const navigate = useNavigate();
  const { createOpposition } = useOppositions();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (asDraft: boolean = false) => {
    try {
      setIsSubmitting(true);
      const opposition = await createOpposition({
        ...formData,
        status: asDraft ? 'draft' : 'pending',
      });
      navigate(`/agent/oppositions/${opposition.id}`);
    } catch (error) {
      console.error('Error creating opposition:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">New Opposition</h1>
            <p className="text-primary-light mt-1">
              Submit a new opposition case
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Submit
          </Button>
        </div>
      </header>

      <form className="space-y-6">
        {/* Application Reference */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Application Reference
          </label>
          <input
            type="text"
            value={formData.application_id}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              application_id: e.target.value
            }))}
            className="w-full bg-background border border-primary/10 rounded-lg px-4 py-2 text-primary"
            placeholder="Enter application number or ID"
          />
        </div>

        {/* Grounds for Opposition */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Grounds for Opposition
          </label>
          <textarea
            value={formData.grounds}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              grounds: e.target.value
            }))}
            rows={6}
            className="w-full bg-background border border-primary/10 rounded-lg px-4 py-2 text-primary"
            placeholder="Enter detailed grounds for opposition"
          />
        </div>

        {/* Filing Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Filing Date
          </label>
          <input
            type="date"
            value={formData.filing_date}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              filing_date: e.target.value
            }))}
            className="w-full bg-background border border-primary/10 rounded-lg px-4 py-2 text-primary"
          />
        </div>

        {/* Supporting Documents */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Supporting Documents
          </label>
          <div className="p-4 border-2 border-dashed border-primary/10 rounded-lg text-center">
            <p className="text-primary-light">
              Drag and drop files here or click to browse
            </p>
            <p className="text-sm text-primary-light mt-2">
              Upload evidence and supporting documents for your opposition
            </p>
            {/* TODO: Implement file upload functionality */}
          </div>
        </div>

        {/* Document List */}
        {formData.documents.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary">
              Uploaded Documents
            </label>
            <ul className="divide-y divide-primary/10 bg-background-alt rounded-lg">
              {formData.documents.map((doc, index) => (
                <li key={index} className="flex items-center justify-between p-3">
                  <span className="text-primary">{doc}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        documents: prev.documents.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
} 