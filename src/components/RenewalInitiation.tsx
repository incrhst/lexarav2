import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { calculateTrademarkRenewalFees, calculatePatentRenewalFees } from '../services/feeCalculationService';
import { sendEmail } from '../services/emailService';

interface RenewalInitiationProps {
  applicationId: string;
  applicationType: 'trademark' | 'patent';
  applicationNumber: string;
  title: string;
  daysUntilRenewal: number;
  isSmallEntity?: boolean;
}

export default function RenewalInitiation({
  applicationId,
  applicationType,
  applicationNumber,
  title,
  daysUntilRenewal,
  isSmallEntity = false,
}: RenewalInitiationProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'invoice'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  useEffect(() => {
    calculateFees();
  }, [applicationId, applicationType]);

  const calculateFees = async () => {
    try {
      // Fetch additional information needed for fee calculation
      const { data: application, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (error) throw error;

      if (applicationType === 'trademark') {
        const fees = calculateTrademarkRenewalFees(
          daysUntilRenewal,
          application.goods_services_class?.length || 1,
          application.is_international || false,
          application.previous_renewals || 0
        );
        setFeeBreakdown(fees);
      } else {
        const yearsSinceGrant = Math.floor(
          (new Date().getTime() - new Date(application.grant_date).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
        );
        
        const fees = calculatePatentRenewalFees(
          daysUntilRenewal,
          yearsSinceGrant + 1,
          isSmallEntity,
          application.has_multiple_patents || false
        );
        setFeeBreakdown(fees);
      }
    } catch (err) {
      console.error('Error calculating fees:', err);
      setError('Failed to calculate renewal fees');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Process payment
      const paymentResult = await processPayment();

      // Create renewal record
      const { data: renewal, error: renewalError } = await supabase
        .from('renewals')
        .insert([
          {
            application_id: applicationId,
            renewal_date: new Date().toISOString(),
            fee_breakdown: feeBreakdown,
            payment_method: paymentMethod,
            payment_status: 'completed',
            payment_reference: paymentResult.transactionId,
            amount_paid: feeBreakdown.total,
          },
        ])
        .select()
        .single();

      if (renewalError) throw renewalError;

      // Update application status
      await supabase
        .from('applications')
        .update({
          last_renewal_date: new Date().toISOString(),
          next_renewal_date: calculateNextRenewalDate(),
          status: 'active',
        })
        .eq('id', applicationId);

      // Send confirmation email
      await sendRenewalConfirmation(renewal);

      // Navigate to success page
      navigate('/renewals/success', {
        state: {
          renewalId: renewal.id,
          applicationNumber,
          title,
          amount: feeBreakdown.total,
        },
      });
    } catch (err) {
      console.error('Error processing renewal:', err);
      setError('Failed to process renewal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    // This is a mock payment processing function
    // In production, integrate with a payment provider like Stripe
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `TXN-${Math.random().toString(36).substr(2, 9)}`,
          amount: feeBreakdown.total,
        });
      }, 1500);
    });
  };

  const calculateNextRenewalDate = () => {
    const today = new Date();
    if (applicationType === 'trademark') {
      today.setFullYear(today.getFullYear() + 10);
    } else {
      today.setFullYear(today.getFullYear() + 1);
    }
    return today.toISOString();
  };

  const sendRenewalConfirmation = async (renewal: any) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.email) return;

    await sendEmail({
      to: user.user.email,
      subject: `Renewal Confirmation - ${title}`,
      templateId: 'renewal-confirmation',
      variables: {
        title,
        applicationNumber,
        renewalDate: new Date().toLocaleDateString(),
        nextRenewalDate: new Date(calculateNextRenewalDate()).toLocaleDateString(),
        amount: feeBreakdown.total,
        reference: renewal.id,
      },
    });
  };

  if (!feeBreakdown) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Renewal Details</h2>
        
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Application</dt>
            <dd className="mt-1 text-sm text-gray-900">{title}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{applicationNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Type</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{applicationType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Due Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(calculateNextRenewalDate()).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Breakdown</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Base Fee</span>
            <span className="font-medium">£{feeBreakdown.baseFee}</span>
          </div>
          
          {feeBreakdown.additionalFees.map((fee: any, index: number) => (
            <div key={index} className="flex justify-between">
              <span className="text-gray-500">{fee.description}</span>
              <span className="font-medium">£{fee.amount}</span>
            </div>
          ))}

          {feeBreakdown.penalties.map((penalty: any, index: number) => (
            <div key={index} className="flex justify-between text-red-600">
              <span>{penalty.description}</span>
              <span className="font-medium">£{penalty.amount}</span>
            </div>
          ))}

          {feeBreakdown.discounts.map((discount: any, index: number) => (
            <div key={index} className="flex justify-between text-green-600">
              <span>{discount.description}</span>
              <span className="font-medium">-£{discount.amount}</span>
            </div>
          ))}

          <div className="border-t pt-3 flex justify-between text-lg font-medium">
            <span>Total</span>
            <span>£{feeBreakdown.total}</span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
        
        <div className="space-y-4">
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'invoice')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2">Credit Card</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                value="invoice"
                checked={paymentMethod === 'invoice'}
                onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'invoice')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2">Invoice</span>
            </label>
          </div>

          {paymentMethod === 'card' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="MM/YY"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvc}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="John Smith"
                  required
                />
              </div>
            </form>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/renewals')}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            `Pay £${feeBreakdown.total}`
          )}
        </button>
      </div>
    </div>
  );
} 