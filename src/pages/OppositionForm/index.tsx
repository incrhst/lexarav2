import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OppositionFormContent from './components/OppositionFormContent';
import { useOppositionForm } from './hooks/useOppositionForm';

export default function OppositionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { application, loading, error, handleSubmit } = useOppositionForm(id);

  if (loading) {
    return <div className="animate-pulse">Loading application details...</div>;
  }

  if (error || !application) {
    return (
      <div className="text-red-600">
        Error loading application details. Please try again.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">File Opposition</h1>
        <p className="mt-1 text-sm text-gray-500">
          Submit your opposition against application{' '}
          <span className="font-medium">{application.trademark_name || application.filing_number}</span>
        </p>
      </header>

      <OppositionFormContent
        application={application}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/applications/${id}`)}
      />
    </div>
  );
}