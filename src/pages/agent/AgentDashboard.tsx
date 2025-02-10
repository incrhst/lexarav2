import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Scale, Search, Clock } from 'lucide-react';
import DashboardStats from '../../components/Dashboard/DashboardStats';
import ApplicationList from '../../components/portfolio/ApplicationList';
import { useApplications } from '../../hooks/useApplications';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { applications, loading, error } = useApplications();

  const stats = {
    activeApplications: applications?.filter(app => app.status === 'active').length || 0,
    pendingOppositions: 0, // Will be implemented with opposition system
    upcomingDeadlines: 0,  // Will be implemented with deadline tracking
    recentUpdates: 0       // Will be implemented with notification system
  };

  const quickActions = [
    {
      title: 'New Application',
      description: 'Start a new IP application',
      icon: FileText,
      action: () => navigate('/agent/applications/new')
    },
    {
      title: 'File Opposition',
      description: 'Submit a new opposition',
      icon: Scale,
      action: () => navigate('/agent/oppositions/new')
    },
    {
      title: 'Search Gazette',
      description: 'Browse the IP gazette',
      icon: Search,
      action: () => navigate('/agent/gazette')
    },
    {
      title: 'View Deadlines',
      description: 'Check upcoming deadlines',
      icon: Clock,
      action: () => navigate('/agent/deadlines')
    }
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-primary">Agent Dashboard</h1>
        <p className="text-primary-light mt-1">
          Manage applications, oppositions, and monitor deadlines
        </p>
      </header>

      {/* Quick Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.title}
            onClick={action.action}
            className="p-4 bg-background-alt rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <action.icon className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold text-primary">{action.title}</h3>
            <p className="text-sm text-primary-light mt-1">{action.description}</p>
          </button>
        ))}
      </section>

      {/* Recent Applications */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary">Recent Applications</h2>
          <button
            onClick={() => navigate('/agent/applications')}
            className="text-sm text-primary-light hover:text-primary"
          >
            View all
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-primary-light">Loading applications...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">Error loading applications</div>
        ) : (
          <ApplicationList
            applications={applications?.slice(0, 5) || []}
            onView={(id) => navigate(`/agent/applications/${id}`)}
          />
        )}
      </section>
    </div>
  );
} 