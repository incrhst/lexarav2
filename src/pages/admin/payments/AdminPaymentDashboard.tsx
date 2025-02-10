import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { format, parseISO } from 'date-fns';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

interface Payment {
  id: string;
  application_id: string;
  application_number: string;
  application_title: string;
  payment_type: 'renewal' | 'filing' | 'opposition';
  amount: number;
  payment_date: string;
  payment_method: 'card' | 'bank_transfer' | 'check';
  status: 'pending' | 'verified' | 'failed' | 'disputed';
  receipt_url: string | null;
  payer_name: string;
  payer_email: string;
  verification_notes: string | null;
}

export default function AdminPaymentDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [verificationNote, setVerificationNote] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string, verified: boolean) => {
    try {
      await supabase
        .from('payments')
        .update({
          status: verified ? 'verified' : 'failed',
          verification_notes: verificationNote || null,
        })
        .eq('id', paymentId);

      setSelectedPayment(null);
      setVerificationNote('');
      fetchPayments();
    } catch (err) {
      console.error('Error verifying payment:', err);
    }
  };

  const getStatusBadge = (payment: Payment) => {
    switch (payment.status) {
      case 'verified':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <CheckCircleIcon className="mr-1 h-4 w-4" />
            Verified
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            <XCircleIcon className="mr-1 h-4 w-4" />
            Failed
          </span>
        );
      case 'disputed':
        return (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
            <ExclamationCircleIcon className="mr-1 h-4 w-4" />
            Disputed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            <ClockIcon className="mr-1 h-4 w-4" />
            Pending
          </span>
        );
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.application_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.payer_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (filter) {
      case 'pending':
        return payment.status === 'pending';
      case 'verified':
        return payment.status === 'verified';
      case 'failed':
        return payment.status === 'failed';
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
          <h1 className="text-xl font-semibold text-gray-900">Payment Verification</h1>
          <p className="mt-2 text-sm text-gray-700">
            Verify payments and manage payment-related issues.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="mb-4 flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as 'all' | 'pending' | 'verified' | 'failed')
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
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
                      Payment Details
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Payer
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
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-gray-900">
                          {payment.application_title}
                        </div>
                        <div className="text-gray-500">{payment.application_number}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div>Amount: £{payment.amount}</div>
                        <div>Method: {payment.payment_method}</div>
                        <div>Date: {format(parseISO(payment.payment_date), 'MMM d, yyyy')}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="font-medium">{payment.payer_name}</div>
                        <div>{payment.payer_email}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getStatusBadge(payment)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {payment.status === 'pending' && (
                          <div className="space-x-4">
                            <button
                              onClick={() => setSelectedPayment(payment)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Verify
                            </button>
                          </div>
                        )}
                        {payment.receipt_url && (
                          <a
                            href={payment.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                          </a>
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

      {/* Verification Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Verify Payment
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Verification Notes
                </label>
                <textarea
                  value={verificationNote}
                  onChange={(e) => setVerificationNote(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerifyPayment(selectedPayment.id, false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Mark as Failed
                </button>
                <button
                  onClick={() => handleVerifyPayment(selectedPayment.id, true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Verify Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 