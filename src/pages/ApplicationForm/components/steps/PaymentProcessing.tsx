import React from 'react';
import { UseFormReturn } from 'react-hook-form';

interface Props {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isLastStep: boolean;
}

export default function PaymentProcessing({ form, onSubmit, onCancel, isLoading, isLastStep }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="paymentAmount" className="block font-medium">Payment Amount</label>
        <input
          id="paymentAmount"
          type="number"
          step="0.01"
          placeholder="Enter amount"
          className="input"
          {...form.register('paymentInfo.amount', { required: 'Payment amount is required' })}
        />
        {form.formState.errors.paymentInfo?.amount && (
          <span className="error text-red-500">{form.formState.errors.paymentInfo.amount.message}</span>
        )}
      </div>
      <div>
        <label htmlFor="paymentMethod" className="block font-medium">Payment Method</label>
        <select
          id="paymentMethod"
          className="input"
          {...form.register('paymentInfo.method', { required: 'Payment method is required' })}
        >
          <option value="">Select payment method</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="check">Check</option>
        </select>
        {form.formState.errors.paymentInfo?.method && (
          <span className="error text-red-500">{form.formState.errors.paymentInfo.method.message}</span>
        )}
      </div>
      <div className="flex justify-between mt-8">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="button" onClick={onSubmit} className="btn-primary" disabled={isLoading}>
          {isLastStep ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
} 