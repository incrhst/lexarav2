import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import FormField from '../../../../components/FormField';
import StepActions from '../StepActions';

interface Props {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isLastStep: boolean;
}

interface FeeCalculation {
  baseFee: number;
  additionalFees: { description: string; amount: number }[];
  penalties: { description: string; amount: number }[];
  total: number;
}

export default function PaymentDetails({
  form,
  onSubmit,
  onCancel,
  isLoading,
  isLastStep,
}: Props) {
  const { register, formState: { errors }, watch } = form;
  const [feeCalculation, setFeeCalculation] = useState<FeeCalculation>({
    baseFee: 0,
    additionalFees: [],
    penalties: [],
    total: 0,
  });

  const applicationType = watch('applicationType');
  const applicationSubType = watch('applicationSubType');
  const goodsServicesClass = watch('goodsServicesClass') || [];
  const annualRenewalYear = watch('annualRenewalYear');

  useEffect(() => {
    calculateFees();
  }, [applicationType, applicationSubType, goodsServicesClass, annualRenewalYear]);

  const calculateFees = () => {
    let calculation: FeeCalculation = {
      baseFee: 0,
      additionalFees: [],
      penalties: [],
      total: 0,
    };

    if (applicationType === 'trademark') {
      // Base trademark fees
      switch (applicationSubType) {
        case 'new':
          calculation.baseFee = 170;
          // Add class fees (£50 per additional class)
          if (goodsServicesClass.length > 1) {
            calculation.additionalFees.push({
              description: `Additional Classes (${goodsServicesClass.length - 1} × £50)`,
              amount: (goodsServicesClass.length - 1) * 50,
            });
          }
          break;
        case 'renewal':
          calculation.baseFee = 200;
          // Add late renewal penalty if applicable
          calculation.penalties.push({
            description: 'Late Renewal Penalty',
            amount: 90,
          });
          break;
        case 'opposition':
          calculation.baseFee = 150;
          break;
        case 'changeOwnership':
          calculation.baseFee = 50;
          break;
        case 'changeNameAddress':
          calculation.baseFee = 30;
          break;
        case 'powerOfAttorney':
          calculation.baseFee = 20;
          break;
        case 'correction':
          calculation.baseFee = 25;
          break;
        case 'counterStatement':
          calculation.baseFee = 100;
          break;
      }
    } else if (applicationType === 'patent') {
      // Base patent fees
      switch (applicationSubType) {
        case 'new':
          calculation.baseFee = 310;
          break;
        case 'renewal':
          // Base renewal fee increases with year
          const baseRenewalFee = 70 + (Number(annualRenewalYear) * 20);
          calculation.baseFee = baseRenewalFee;
          // Add 10% late penalty if applicable
          calculation.penalties.push({
            description: 'Late Renewal Penalty (10%)',
            amount: Math.round(baseRenewalFee * 0.1),
          });
          break;
        case 'opposition':
          calculation.baseFee = 250;
          break;
        case 'nonVoluntaryLicense':
          calculation.baseFee = 300;
          break;
        case 'changeOwnership':
          calculation.baseFee = 100;
          break;
        case 'changeNameAddress':
          calculation.baseFee = 50;
          break;
        case 'powerOfAttorney':
          calculation.baseFee = 30;
          break;
        case 'correction':
          calculation.baseFee = 40;
          break;
      }
    }

    // Calculate total
    calculation.total = calculation.baseFee +
      calculation.additionalFees.reduce((sum, fee) => sum + fee.amount, 0) +
      calculation.penalties.reduce((sum, penalty) => sum + penalty.amount, 0);

    setFeeCalculation(calculation);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Fee Breakdown */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Base Fee</span>
            <span className="font-medium">£{feeCalculation.baseFee}</span>
          </div>
          
          {feeCalculation.additionalFees.map((fee, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-gray-500">{fee.description}</span>
              <span className="font-medium">£{fee.amount}</span>
            </div>
          ))}

          {feeCalculation.penalties.map((penalty, index) => (
            <div key={index} className="flex justify-between text-red-600">
              <span>{penalty.description}</span>
              <span className="font-medium">£{penalty.amount}</span>
            </div>
          ))}

          <div className="border-t pt-3 flex justify-between text-lg font-medium">
            <span>Total</span>
            <span>£{feeCalculation.total}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
        
        <div className="space-y-4">
          <FormField
            label="Card Number"
            error={errors.cardNumber?.message}
          >
            <input
              type="text"
              {...register('cardNumber', { 
                required: 'Card number is required',
                pattern: {
                  value: /^[0-9]{16}$/,
                  message: 'Please enter a valid 16-digit card number'
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="1234 5678 9012 3456"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Expiry Date"
              error={errors.expiryDate?.message}
            >
              <input
                type="text"
                {...register('expiryDate', { 
                  required: 'Expiry date is required',
                  pattern: {
                    value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                    message: 'Please enter a valid expiry date (MM/YY)'
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="MM/YY"
              />
            </FormField>

            <FormField
              label="CVV"
              error={errors.cvv?.message}
            >
              <input
                type="text"
                {...register('cvv', { 
                  required: 'CVV is required',
                  pattern: {
                    value: /^[0-9]{3,4}$/,
                    message: 'Please enter a valid CVV'
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="123"
              />
            </FormField>
          </div>

          <FormField
            label="Cardholder Name"
            error={errors.cardholderName?.message}
          >
            <input
              type="text"
              {...register('cardholderName', { required: 'Cardholder name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="John Smith"
            />
          </FormField>
        </div>
      </div>

      <StepActions
        onCancel={onCancel}
        isLoading={isLoading}
        isLastStep={isLastStep}
      />
    </form>
  );
} 