import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useOppositions } from '../../hooks/useOppositions';
import Button from '../../components/Button';

export default function OppositionManager() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { oppositions, loading, error } = useOppositions();

  const filteredOppositions = oppositions?.filter(opp => 
    statusFilter === 'all' ? true : opp.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Opposition Management</h1>
          <p className="text-primary-light mt-1">
            Track and manage your opposition cases
          </p>
        </div>
        <Button
          onClick={() => navigate('/agent/oppositions/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Opposition
        </Button>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-background-alt rounded-lg">
        <Filter className="h-5 w-5 text-primary" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-background text-primary border border-primary/10 rounded-md px-3 py-1"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      {/* Opposition List */}
      {loading ? (
        <div className="text-center py-8 text-primary-light">
          Loading oppositions...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          Error loading oppositions
        </div>
      ) : !filteredOppositions?.length ? (
        <div className="text-center py-8 text-primary-light">
          No oppositions found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOppositions.map((opposition) => (
            <div
              key={opposition.id}
              onClick={() => navigate(`/agent/oppositions/${opposition.id}`)}
              className="p-4 bg-background-alt rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-primary">
                    Opposition to Application #{opposition.application_id}
                  </h3>
                  <p className="text-sm text-primary-light mt-1">
                    Filed on: {new Date(opposition.filing_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-primary-light mt-1">
                    Status: {opposition.status.charAt(0).toUpperCase() + opposition.status.slice(1)}
                  </p>
                </div>
                {opposition.resolution_date && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      Resolved on:
                    </p>
                    <p className="text-sm text-primary-light">
                      {new Date(opposition.resolution_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-primary line-clamp-2">
                {opposition.grounds}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 