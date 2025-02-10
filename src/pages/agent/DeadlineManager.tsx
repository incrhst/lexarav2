import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Filter, Clock, CheckCircle2 } from 'lucide-react';
import { useDeadlines } from '../../hooks/useDeadlines';
import Button from '../../components/Button';

export default function DeadlineManager() {
  const navigate = useNavigate();
  const { deadlines, toggleDeadlineCompletion } = useDeadlines();
  const [showCompleted, setShowCompleted] = useState(false);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredDeadlines = deadlines?.filter(deadline => {
    if (!showCompleted && deadline.completed) return false;
    if (entityTypeFilter !== 'all' && deadline.entity_type !== entityTypeFilter) return false;
    if (priorityFilter !== 'all' && deadline.priority !== priorityFilter) return false;
    return true;
  });

  const priorityColors = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Deadline Manager</h1>
          <p className="text-primary-light mt-1">
            Track and manage deadlines for applications and oppositions
          </p>
        </div>
        <Button
          onClick={() => {/* TODO: Implement new deadline modal */}}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Deadline
        </Button>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-background-alt rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <select
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
            className="bg-background text-primary border border-primary/10 rounded-md px-3 py-1"
          >
            <option value="all">All Types</option>
            <option value="application">Applications</option>
            <option value="opposition">Oppositions</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-background text-primary border border-primary/10 rounded-md px-3 py-1"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <label className="flex items-center gap-2 text-primary">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded border-primary/10"
            />
            Show Completed
          </label>
        </div>
      </div>

      {/* Calendar View */}
      <section className="bg-background-alt p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-primary">Calendar</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Month
            </Button>
            <Button variant="ghost" size="sm">Week</Button>
            <Button variant="ghost" size="sm">Day</Button>
          </div>
        </div>
        <div className="h-96 border border-primary/10 rounded-lg">
          {/* TODO: Implement calendar view */}
          <div className="flex items-center justify-center h-full text-primary-light">
            Calendar view will be implemented here
          </div>
        </div>
      </section>

      {/* Deadline List */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">Upcoming Deadlines</h2>
        {filteredDeadlines?.length === 0 ? (
          <div className="text-center py-8 text-primary-light">
            No deadlines found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeadlines?.map((deadline) => (
              <div
                key={deadline.id}
                className="bg-background-alt p-4 rounded-lg shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-primary">{deadline.title}</h3>
                      <span className={`text-sm ${priorityColors[deadline.priority]}`}>
                        {deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)} Priority
                      </span>
                    </div>
                    <p className="text-sm text-primary-light mt-1">
                      Due: {new Date(deadline.due_date).toLocaleDateString()}
                    </p>
                    {deadline.description && (
                      <p className="text-sm text-primary mt-2">{deadline.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (deadline.entity_type === 'application') {
                          navigate(`/agent/applications/${deadline.entity_id}`);
                        } else {
                          navigate(`/agent/oppositions/${deadline.entity_id}`);
                        }
                      }}
                    >
                      View {deadline.entity_type}
                    </Button>
                    <input
                      type="checkbox"
                      checked={deadline.completed}
                      onChange={() => toggleDeadlineCompletion(deadline.id)}
                      className="h-5 w-5 rounded border-primary/10"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 