import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RenewalStats from '../components/RenewalStats';
import RenewalCalendar from '../components/RenewalCalendar';
import { format, parseISO, addDays } from 'date-fns';

interface Application {
  id: string;
  title: string;
  application_number: string;
  type: 'trademark' | 'patent';
  status: string;
  filing_date: string;
  last_renewal_date: string | null;
  next_renewal_date: string;
  is_international?: boolean;
  goods_services_class?: string[];
  is_small_entity?: boolean;
}

interface RenewalEvent {
  id: string;
  title: string;
  type: 'trademark' | 'patent';
  date: string;
  status: 'upcoming' | 'overdue' | 'completed';
}

export default function RenewalDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRenewals: 0,
    upcomingRenewals: 0,
    overdueRenewals: 0,
    totalRevenue: 0,
    recentTrends: {
      percentage: 0,
      trend: 'up' as const,
      description: '',
    },
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('next_renewal_date', { ascending: true });

      if (error) throw error;

      setApplications(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps: Application[]) => {
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);

    const upcoming = apps.filter(
      (app) =>
        new Date(app.next_renewal_date) <= thirtyDaysFromNow &&
        new Date(app.next_renewal_date) > now
    ).length;

    const overdue = apps.filter(
      (app) => new Date(app.next_renewal_date) < now
    ).length;

    // Calculate total revenue (this would typically come from your renewals table)
    const revenue = 25000; // Example value

    // Calculate trends (this would typically compare with previous period)
    const previousPeriodRenewals = 45; // Example value
    const currentPeriodRenewals = 52; // Example value
    const percentageChange = Math.round(
      ((currentPeriodRenewals - previousPeriodRenewals) / previousPeriodRenewals) * 100
    );

    setStats({
      totalRenewals: apps.length,
      upcomingRenewals: upcoming,
      overdueRenewals: overdue,
      totalRevenue: revenue,
      recentTrends: {
        percentage: Math.abs(percentageChange),
        trend: percentageChange >= 0 ? 'up' : 'down',
        description: `${percentageChange >= 0 ? 'Increased' : 'Decreased'} from last month`,
      },
    });
  };

  const getCalendarEvents = (): RenewalEvent[] => {
    return applications.map((app) => ({
      id: app.id,
      title: app.title,
      type: app.type,
      date: app.next_renewal_date,
      status: getEventStatus(app.next_renewal_date),
    }));
  };

  const getEventStatus = (date: string): RenewalEvent['status'] => {
    const now = new Date();
    const eventDate = new Date(date);
    const thirtyDaysFromNow = addDays(now, 30);

    if (eventDate < now) return 'overdue';
    if (eventDate <= thirtyDaysFromNow) return 'upcoming';
    return 'completed';
  };

  const handleEventClick = (event: RenewalEvent) => {
    const application = applications.find((app) => app.id === event.id);
    if (!application) return;

    navigate(`/renewals/initiate/${application.id}`, {
      state: {
        applicationId: application.id,
        applicationType: application.type,
        applicationNumber: application.application_number,
        title: application.title,
        daysUntilRenewal: Math.ceil(
          (new Date(application.next_renewal_date).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        isSmallEntity: application.is_small_entity,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Renewal Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your intellectual property renewals
          </p>
        </div>
      </div>

      <RenewalStats
        totalRenewals={stats.totalRenewals}
        upcomingRenewals={stats.upcomingRenewals}
        overdueRenewals={stats.overdueRenewals}
        totalRevenue={stats.totalRevenue}
        recentTrends={stats.recentTrends}
      />

      <div className="bg-white shadow rounded-lg">
        <RenewalCalendar
          events={getCalendarEvents()}
          onEventClick={handleEventClick}
        />
      </div>
    </div>
  );
} 