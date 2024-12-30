import React from 'react';
import { useParams } from 'react-router-dom';
import { useAgentClient } from '../hooks/useAgentClient';
import ClientApplications from './ClientApplications';
import Button from '../../../components/Button';

export default function ClientDetails() {
  const { id } = useParams();
  const { client, loading } = useAgentClient(id);

  if (loading) {
    return <div className="animate-pulse">Loading client details...</div>;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">{client.client_name}</h1>
          <p className="mt-1 text-sm text-primary-light">{client.company_name}</p>
        </div>
        <Button>New Application</Button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-primary mb-4">Client Information</h2>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.contact_email || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.contact_phone || '-'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.address || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.country}</dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="text-lg font-medium text-primary mb-4">Applications</h2>
        <ClientApplications clientId={client.id} />
      </div>
    </div>
  );
}