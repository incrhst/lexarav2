import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ClientList from './components/ClientList';
import AddClientDialog from './components/AddClientDialog';
import { useAgentClients } from './hooks/useAgentClients';
import Button from '../../components/Button';

export default function AgentDashboard() {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const { addClient } = useAgentClients();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Client Management</h1>
          <p className="mt-1 text-sm text-primary-light">
            Manage your client portfolio and their applications
          </p>
        </div>
        <Button
          onClick={() => setIsAddClientOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      <ClientList />

      <AddClientDialog
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onAdd={addClient}
      />
    </div>
  );
}