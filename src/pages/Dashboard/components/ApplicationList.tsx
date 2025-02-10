import React from 'react';
import { Link } from 'react-router-dom';
import { useApplications } from '../../../hooks/useApplications';
import { formatDate } from '../../../utils/date';
import ApplicationStatusBadge from '../../../components/ApplicationStatusBadge';
import Button from '../../../components/Button';

export default function ApplicationList() {
  const { applications, loading, error } = useApplications();

  if (error) {
    return <div className="text-red-600">Error loading applications. Please try again later.</div>;
  }

  if (loading) {
    return <div className="animate-pulse">Loading applications...</div>;
  }

  return (
    <div className="bg-background-alt p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-primary mb-4">Your Applications</h2>
      <div className="text-primary-light text-center py-8">
        No applications found. Click "Create Application" to get started.
      </div>
    </div>
  );
}