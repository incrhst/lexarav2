import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

interface PaymentSystemProps {}

export default function PaymentSystem(props: PaymentSystemProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<{ invoiceId: string; amount: string; date: string } | null>(null);
  const [refundStatus, setRefundStatus] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate creating a PaymentIntent on the server
      const res = await axios.post('/api/create-payment-intent', {
        amount: 1000 // amount in cents for $10.00
      });
      const clientSecret = res.data.clientSecret;
      setPaymentIntent(clientSecret);

      // Confirm the card payment using Stripe
      const cardElement = elements.getElement(CardElement);
      const confirmRes = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement!
        }
      });

      if (confirmRes.error) {
        setError(confirmRes.error.message || 'Payment failed');
      } else {
        if (confirmRes.paymentIntent && confirmRes.paymentIntent.status === 'succeeded') {
          // Simulate invoice and receipt retrieval
          setInvoice({
            invoiceId: 'INV123456',
            amount: '10.00',
            date: new Date().toLocaleDateString()
          });
          setReceiptUrl('https://example.com/receipt.pdf');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing error');
    }

    setIsProcessing(false);
  };

  // Simulated refund handler
  const handleRefund = async () => {
    try {
      const res = await axios.post('/api/refund-payment', {
        paymentIntentId: paymentIntent
      });
      if (res.data.refunded) {
        setRefundStatus('Refund processed successfully');
      } else {
        setRefundStatus('Refund failed');
      }
    } catch (err: any) {
      setRefundStatus('Refund failed');
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Payment System</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border p-4 rounded">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button type="submit" disabled={!stripe || isProcessing} className="btn-primary">
          {isProcessing ? 'Processing...' : 'Pay $10.00'}
        </button>
      </form>
      {invoice && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-xl font-semibold">Invoice</h3>
          <p>Invoice ID: {invoice.invoiceId}</p>
          <p>Amount: ${invoice.amount}</p>
          <p>Date: {invoice.date}</p>
        </div>
      )}
      {receiptUrl && (
        <div className="mt-4">
          <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            View Receipt
          </a>
        </div>
      )}
      {paymentIntent && !refundStatus && (
        <div className="mt-4">
          <button onClick={handleRefund} className="btn-danger">
            Process Refund
          </button>
        </div>
      )}
      {refundStatus && (
        <div className="mt-4 text-green-600">{refundStatus}</div>
      )}
    </div>
  );
} 