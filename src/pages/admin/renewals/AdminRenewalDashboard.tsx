import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { format, parseISO, addDays } from 'date-fns';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';

interface RenewalApplication {
  id: string;
  title: string;
  application_number: string;
  type: 'trademark' | 'patent';
  status: string;
  next_renewal_date: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  owner_name: string;
  owner_email: string;
}

export default function AdminRenewalDashboard() {
  const [renewals, setRenewals] = useState<RenewalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          title,
          application_number,
          type,
          status,
          next_renewal_date,
          payment_status,
          amount,
          owner_name,
          owner_email
        `)
        .order('next_renewal_date', { ascending: true });

      if (error) throw error;
      setRenewals(data || []);
    } catch (err) {
      console.error('Error fetching renewals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (renewalId: string) => {
    try {
      await supabase
        .from('applications')
        .update({ payment_status: 'processing' })
        .eq('id', renewalId);

      // Refresh the renewals list
      fetchRenewals();
    } catch (err) {
      console.error('Error processing payment:', err);
    }
  };

  const handleVerifyPayment = async (renewalId: string) => {
    try {
      await supabase
        .from('applications')
        .update({ payment_status: 'completed' })
        .eq('id', renewalId);

      // Refresh the renewals list
      fetchRenewals();
    } catch (err) {
      console.error('Error verifying payment:', err);
    }
  };

  const getStatusBadge = (renewal: RenewalApplication) => {
    const dueDate = parseISO(renewal.next_renewal_date);
    const today = new Date();
    const isOverdue = dueDate < today;

    if (isOverdue) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          <ExclamationCircleIcon className="mr-1 h-4 w-4" />
          Overdue
        </span>
      );
    }

    if (renewal.payment_status === 'completed') {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          <CheckCircleIcon className="mr-1 h-4 w-4" />
          Completed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
        <ClockIcon className="mr-1 h-4 w-4" />
        Pending
      </span>
    );
  };

  const filteredRenewals = renewals.filter((renewal) => {
    const matchesSearch =
      renewal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      renewal.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      renewal.owner_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const dueDate = parseISO(renewal.next_renewal_date);
    const today = new Date();
    const isOverdue = dueDate < today;

    switch (filter) {
      case 'pending':
        return !isOverdue && renewal.payment_status !== 'completed';
      case 'overdue':
        return isOverdue;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Renewal Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and process renewal applications and payments.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="mb-4 flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search renewals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'overdue')}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All Renewals</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Application
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Owner
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Due Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredRenewals.map((renewal) => (
                    <tr key={renewal.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-gray-900">{renewal.title}</div>
                        <div className="text-gray-500">{renewal.application_number}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="capitalize">{renewal.type}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="font-medium text-gray-900">{renewal.owner_name}</div>
                        <div className="text-gray-500">{renewal.owner_email}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {format(parseISO(renewal.next_renewal_date), 'MMM d, yyyy')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        £{renewal.amount}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getStatusBadge(renewal)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {renewal.payment_status === 'pending' && (
                          <button
                            onClick={() => handleProcessPayment(renewal.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Process Payment
                          </button>
                        )}
                        {renewal.payment_status === 'processing' && (
                          <button
                            onClick={() => handleVerifyPayment(renewal.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Verify Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 