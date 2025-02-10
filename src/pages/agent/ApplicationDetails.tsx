import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Clock, FileText, Send } from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';
import { useDeadlines } from '../../hooks/useDeadlines';
import Button from '../../components/Button';

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications, updateApplication, deleteApplication } = useApplications();
  const { deadlines, createDeadline } = useDeadlines();
  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);

  useEffect(() => {
    if (id && applications) {
      const app = applications.find(a => a.id === id);
      if (app) {
        setApplication(app);
        setIsLoading(false);
      }
    }
  }, [id, applications]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-primary">Loading application details...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8">
        <p className="text-primary">Application not found</p>
        <Button
          variant="secondary"
          onClick={() => navigate('/agent/applications')}
          className="mt-4"
        >
          Back to Applications
        </Button>
      </div>
    );
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateApplication(id!, { status: newStatus });
      // TODO: Show success toast
    } catch (error) {
      console.error('Error updating status:', error);
      // TODO: Show error toast
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteApplication(id!);
        navigate('/agent/applications');
        // TODO: Show success toast
      } catch (error) {
        console.error('Error deleting application:', error);
        // TODO: Show error toast
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <h1 className="text-2xl font-bold text-primary">{application.title}</h1>
            <p className="text-primary-light mt-1">
              {application.application_number || 'Draft Application'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/agent/applications/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          {application.status === 'draft' && (
            <Button
              onClick={() => handleStatusUpdate('pending')}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Details */}
          <section className="bg-background-alt p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-4">Application Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-primary-light">Type</dt>
                <dd className="text-primary font-medium capitalize">{application.type}</dd>
              </div>
              <div>
                <dt className="text-sm text-primary-light">Status</dt>
                <dd className="text-primary font-medium capitalize">{application.status}</dd>
              </div>
              <div>
                <dt className="text-sm text-primary-light">Filing Date</dt>
                <dd className="text-primary font-medium">
                  {application.filing_date
                    ? new Date(application.filing_date).toLocaleDateString()
                    : 'Not filed'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-primary-light">Applicant</dt>
                <dd className="text-primary font-medium">{application.applicant_name}</dd>
              </div>
            </dl>
          </section>

          {/* Description */}
          <section className="bg-background-alt p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-4">Description</h2>
            <p className="text-primary whitespace-pre-wrap">{application.description}</p>
          </section>

          {/* Documents */}
          <section className="bg-background-alt p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary">Documents</h2>
              <Button variant="secondary" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
            {application.documents?.length > 0 ? (
              <ul className="divide-y divide-primary/10">
                {application.documents.map((doc: string, index: number) => (
                  <li key={index} className="py-3 flex items-center justify-between">
                    <span className="text-primary">{doc}</span>
                    <Button variant="ghost" size="sm">Download</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-primary-light text-center py-4">
                No documents uploaded yet
              </p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Deadlines */}
          <section className="bg-background-alt p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary">Deadlines</h2>
              <Button variant="secondary" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            {deadlines?.filter(d => d.entity_id === id).length > 0 ? (
              <ul className="divide-y divide-primary/10">
                {deadlines
                  .filter(d => d.entity_id === id)
                  .map(deadline => (
                    <li key={deadline.id} className="py-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-primary font-medium">{deadline.title}</p>
                          <p className="text-sm text-primary-light">
                            Due: {new Date(deadline.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={deadline.completed}
                          onChange={() => {/* TODO: Implement deadline completion */}}
                          className="mt-1"
                        />
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-primary-light text-center py-4">
                No deadlines set
              </p>
            )}
          </section>

          {/* Timeline */}
          <section className="bg-background-alt p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-4">Timeline</h2>
            <div className="space-y-4">
              {/* TODO: Implement application timeline */}
              <p className="text-primary-light text-center py-4">
                Timeline will be shown here
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 