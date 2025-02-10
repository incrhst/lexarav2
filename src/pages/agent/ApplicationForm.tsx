import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';
import Button from '../../components/Button';

type ApplicationType = 'trademark' | 'patent' | 'design' | 'copyright';

interface FormData {
  type: ApplicationType;
  title: string;
  description: string;
  applicant_name: string;
  documents: string[];
}

const initialFormData: FormData = {
  type: 'trademark',
  title: '',
  description: '',
  applicant_name: '',
  documents: [],
};

export default function ApplicationForm() {
  const navigate = useNavigate();
  const { createApplication } = useApplications();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (asDraft: boolean = false) => {
    try {
      setIsSubmitting(true);
      const application = await createApplication({
        ...formData,
        status: asDraft ? 'draft' : 'pending',
      });
      navigate(`/agent/applications/${application.id}`);
    } catch (error) {
      console.error('Error creating application:', error);
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
            <h1 className="text-2xl font-bold text-primary">New Application</h1>
            <p className="text-primary-light mt-1">
              Submit a new IP application
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
        {/* Application Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Application Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              type: e.target.value as ApplicationType
            }))}
            className="w-full bg-background border border-primary/10 rounded-lg px-4 py-2 text-primary"
          >
            <option value="trademark">Trademark</option>
            <option value="patent">Patent</option>
            <option value="design">Design</option>
            <option value="copyright">Copyright</option>
          </select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              title: e.target.value
            }))}
            className="w-full bg-background border border-primary/10 rounded-lg px-4 py-2 text-primary"
            placeholder="Enter application title"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              description: e.target.value
            }))}
            rows={4}
            className="w-full bg-background border border-primary/10 rounded-lg px-4 py-2 text-primary"
            placeholder="Enter application description"
          />
        </div>

        {/* Applicant Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Applicant Name
          </label>
          <input
            type="text"
            value={formData.applicant_name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicant_name: e.target.value
            }))}
            className="w-full bg-background border border-primary/10 rounded-lg px-4 py-2 text-primary"
            placeholder="Enter applicant name"
          />
        </div>

        {/* Document Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Documents
          </label>
          <div className="p-4 border-2 border-dashed border-primary/10 rounded-lg text-center">
            <p className="text-primary-light">
              Drag and drop files here or click to browse
            </p>
            {/* TODO: Implement file upload functionality */}
          </div>
        </div>
      </form>
    </div>
  );
} 