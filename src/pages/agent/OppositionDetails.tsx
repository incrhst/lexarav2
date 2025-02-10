import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Clock, FileText } from 'lucide-react';
import { useOppositions } from '../../hooks/useOppositions';
import { useDeadlines } from '../../hooks/useDeadlines';
import Button from '../../components/Button';

export default function OppositionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { oppositions, updateOpposition, deleteOpposition } = useOppositions();
  const { deadlines } = useDeadlines();
  const [isLoading, setIsLoading] = useState(true);
  const [opposition, setOpposition] = useState<any>(null);

  useEffect(() => {
    if (id && oppositions) {
      const opp = oppositions.find(o => o.id === id);
      if (opp) {
        setOpposition(opp);
        setIsLoading(false);
      }
    }
  }, [id, oppositions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-primary">Loading opposition details...</div>
      </div>
    );
  }

  if (!opposition) {
    return (
      <div className="text-center py-8">
        <p className="text-primary">Opposition not found</p>
        <Button
          variant="secondary"
          onClick={() => navigate('/agent/oppositions')}
          className="mt-4"
        >
          Back to Oppositions
        </Button>
      </div>
    );
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateOpposition(id!, { status: newStatus });
      // TODO: Show success toast
    } catch (error) {
      console.error('Error updating status:', error);
      // TODO: Show error toast
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this opposition?')) {
      try {
        await deleteOpposition(id!);
        navigate('/agent/oppositions');
        // TODO: Show success toast
      } catch (error) {
        console.error('Error deleting opposition:', error);
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
            <h1 className="text-2xl font-bold text-primary">
              Opposition to Application #{opposition.application_id}
            </h1>
            <p className="text-primary-light mt-1">
              Filed on: {new Date(opposition.filing_date).toLocaleDateString()}
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
            onClick={() => navigate(`/agent/oppositions/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Opposition Details */}
          <section className="bg-background-alt p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-4">Opposition Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-primary-light">Status</dt>
                <dd className="text-primary font-medium capitalize">{opposition.status}</dd>
              </div>
              <div>
                <dt className="text-sm text-primary-light">Filing Date</dt>
                <dd className="text-primary font-medium">
                  {new Date(opposition.filing_date).toLocaleDateString()}
                </dd>
              </div>
              {opposition.resolution_date && (
                <>
                  <div>
                    <dt className="text-sm text-primary-light">Resolution Date</dt>
                    <dd className="text-primary font-medium">
                      {new Date(opposition.resolution_date).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-primary-light">Resolution</dt>
                    <dd className="text-primary font-medium">
                      {opposition.resolution_details || 'No details provided'}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </section>

          {/* Grounds for Opposition */}
          <section className="bg-background-alt p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-4">Grounds for Opposition</h2>
            <p className="text-primary whitespace-pre-wrap">{opposition.grounds}</p>
          </section>

          {/* Documents */}
          <section className="bg-background-alt p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary">Supporting Documents</h2>
              <Button variant="secondary" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
            {opposition.documents?.length > 0 ? (
              <ul className="divide-y divide-primary/10">
                {opposition.documents.map((doc: string, index: number) => (
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
          {/* Status Actions */}
          <section className="bg-background-alt p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-4">Actions</h2>
            <div className="space-y-3">
              {opposition.status === 'draft' && (
                <Button
                  onClick={() => handleStatusUpdate('pending')}
                  className="w-full"
                >
                  Submit Opposition
                </Button>
              )}
              {opposition.status === 'pending' && (
                <Button
                  onClick={() => handleStatusUpdate('active')}
                  className="w-full"
                >
                  Mark as Active
                </Button>
              )}
              {opposition.status === 'active' && (
                <>
                  <Button
                    onClick={() => handleStatusUpdate('resolved')}
                    className="w-full"
                  >
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleStatusUpdate('withdrawn')}
                    className="w-full"
                  >
                    Withdraw Opposition
                  </Button>
                </>
              )}
            </div>
          </section>

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
              {/* TODO: Implement opposition timeline */}
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