import React from 'react';
import { useParams } from 'react-router-dom';
import { useAgentDetails } from '../../hooks/useAgentDetails';
import ClientList from './ClientList';

export default function AgentDetails() {
  const { id } = useParams();
  const { agent, loading } = useAgentDetails(id);

  if (loading) {
    return <div className="animate-pulse">Loading agent details...</div>;
  }

  if (!agent) {
    return <div>Agent not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">{agent.full_name}</h1>
        <p className="mt-1 text-sm text-primary-light">{agent.email}</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-primary mb-4">Agent Information</h2>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Company</dt>
            <dd className="mt-1 text-sm text-gray-900">{agent.company_name || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{agent.phone || '-'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-sm text-gray-900">{agent.address || '-'}</dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="text-lg font-medium text-primary mb-4">Client Portfolio</h2>
        <ClientList agentId={agent.id} />
      </div>
    </div>
  );
}