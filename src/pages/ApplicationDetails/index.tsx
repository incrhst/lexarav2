import React from 'react';
import { useParams } from 'react-router-dom';
import { useApplicationDetails } from './hooks/useApplicationDetails';
import ApplicationHeader from './components/ApplicationHeader';
import StatusTimeline from './components/StatusTimeline';
import ApplicationInfo from './components/ApplicationInfo';
import OppositionSection from './components/OppositionSection';

export default function ApplicationDetails() {
  const { id } = useParams();
  const { application, loading, error } = useApplicationDetails(id);

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
    <div className="space-y-6">
      <ApplicationHeader application={application} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ApplicationInfo application={application} />
          <OppositionSection applicationId={application.id} />
        </div>
        <div>
          <StatusTimeline application={application} />
        </div>
      </div>
    </div>
  );
}