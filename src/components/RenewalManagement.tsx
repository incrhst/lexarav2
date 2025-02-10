import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface RenewalInfo {
  id: string;
  applicationType: 'trademark' | 'patent';
  applicationNumber: string;
  title: string;
  filingDate: string;
  nextRenewalDate: string;
  renewalFee: number;
  status: string;
  daysUntilRenewal: number;
}

export default function RenewalManagement() {
  const { user } = useAuth();
  const [renewals, setRenewals] = useState<RenewalInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRenewals();
    }
  }, [user]);

  const fetchRenewals = async () => {
    try {
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .eq('applicant_id', user?.id)
        .in('status', ['registered', 'granted']);

      if (error) throw error;

      const renewalInfo = applications.map(app => {
        const filingDate = new Date(app.created_at);
        const nextRenewalDate = calculateNextRenewalDate(app);
        const daysUntilRenewal = calculateDaysUntilRenewal(nextRenewalDate);
        const renewalFee = calculateRenewalFee(app, daysUntilRenewal);

        return {
          id: app.id,
          applicationType: app.application_type,
          applicationNumber: app.application_number,
          title: app.trademark_name || app.invention_title,
          filingDate: filingDate.toLocaleDateString(),
          nextRenewalDate: nextRenewalDate.toLocaleDateString(),
          renewalFee,
          status: app.status,
          daysUntilRenewal,
        };
      });

      setRenewals(renewalInfo);
    } catch (error) {
      console.error('Error fetching renewals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextRenewalDate = (application: any): Date => {
    const filingDate = new Date(application.created_at);
    const today = new Date();

    if (application.application_type === 'trademark') {
      // Trademarks: 10-year renewals
      const renewalYears = Math.floor((today.getTime() - filingDate.getTime()) / (10 * 365.25 * 24 * 60 * 60 * 1000));
      const nextRenewalDate = new Date(filingDate);
      nextRenewalDate.setFullYear(filingDate.getFullYear() + (renewalYears + 1) * 10);
      return nextRenewalDate;
    } else {
      // Patents: annual renewals
      const renewalYears = Math.floor((today.getTime() - filingDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const nextRenewalDate = new Date(filingDate);
      nextRenewalDate.setFullYear(filingDate.getFullYear() + renewalYears + 1);
      return nextRenewalDate;
    }
  };

  const calculateDaysUntilRenewal = (renewalDate: Date): number => {
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateRenewalFee = (application: any, daysUntilRenewal: number): number => {
    if (application.application_type === 'trademark') {
      // Trademark renewal fees
      const baseFee = 200;
      // Add late fee if within 6 months of deadline
      const lateFee = daysUntilRenewal < 180 ? 90 : 0;
      return baseFee + lateFee;
    } else {
      // Patent renewal fees - increases with year
      const yearsSinceGrant = Math.floor(
        (new Date().getTime() - new Date(application.created_at).getTime()) / 
        (365.25 * 24 * 60 * 60 * 1000)
      );
      const baseRenewalFee = 70 + (yearsSinceGrant * 20);
      // Add 10% late fee if within 3 months of deadline
      const lateFee = daysUntilRenewal < 90 ? Math.round(baseRenewalFee * 0.1) : 0;
      return baseRenewalFee + lateFee;
    }
  };

  const getRenewalStatus = (daysUntilRenewal: number): string => {
    if (daysUntilRenewal < 0) return 'Overdue';
    if (daysUntilRenewal < 30) return 'Urgent';
    if (daysUntilRenewal < 90) return 'Due Soon';
    return 'Upcoming';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Overdue':
        return 'text-red-600 bg-red-100';
      case 'Urgent':
        return 'text-orange-600 bg-orange-100';
      case 'Due Soon':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-xl font-semibold text-gray-900">Renewal Management</h2>
          <p className="mt-2 text-sm text-gray-700">
            Track and manage your upcoming trademark and patent renewals.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {renewals.map((renewal) => (
          <div
            key={renewal.id}
            className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
          >
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {renewal.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {renewal.applicationNumber}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatusColor(getRenewalStatus(renewal.daysUntilRenewal))
                  }`}
                >
                  {getRenewalStatus(renewal.daysUntilRenewal)}
                </span>
              </div>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {renewal.applicationType}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Filing Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{renewal.filingDate}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Next Renewal</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {renewal.nextRenewalDate}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Renewal Fee</dt>
                  <dd className="mt-1 text-sm text-gray-900">£{renewal.renewalFee}</dd>
                </div>
              </dl>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => {/* Handle renewal initiation */}}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Initiate Renewal
              </button>
            </div>
          </div>
        ))}
      </div>

      {renewals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">
            No renewals found. Applications will appear here once they are registered or granted.
          </p>
        </div>
      )}
    </div>
  );
} 

