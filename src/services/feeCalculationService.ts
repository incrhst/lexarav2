interface FeeBreakdown {
  baseFee: number;
  additionalFees: { description: string; amount: number }[];
  penalties: { description: string; amount: number }[];
  discounts: { description: string; amount: number }[];
  total: number;
}

export function calculateTrademarkRenewalFees(
  daysUntilRenewal: number,
  classCount: number,
  isInternational: boolean,
  previousRenewals: number
): FeeBreakdown {
  const breakdown: FeeBreakdown = {
    baseFee: 0,
    additionalFees: [],
    penalties: [],
    discounts: [],
    total: 0
  };

  // Base fee calculation
  breakdown.baseFee = isInternational ? 250 : 200;

  // Additional class fees
  if (classCount > 1) {
    breakdown.additionalFees.push({
      description: `Additional Classes (${classCount - 1} × £50)`,
      amount: (classCount - 1) * 50
    });
  }

  // International processing fee
  if (isInternational) {
    breakdown.additionalFees.push({
      description: 'International Processing Fee',
      amount: 100
    });
  }

  // Late renewal penalties
  if (daysUntilRenewal < 0) {
    // After expiry but within 6 months
    if (daysUntilRenewal > -180) {
      breakdown.penalties.push({
        description: 'Late Renewal Fee (within 6 months)',
        amount: 90
      });
    } else {
      // After 6 months - requires restoration
      breakdown.penalties.push({
        description: 'Restoration Fee',
        amount: 150
      });
    }
  }

  // Loyalty discount for multiple renewals
  if (previousRenewals > 1) {
    const discountAmount = Math.min(previousRenewals * 10, 50); // Max £50 discount
    breakdown.discounts.push({
      description: `Loyalty Discount (${previousRenewals} previous renewals)`,
      amount: discountAmount
    });
  }

  // Calculate total
  breakdown.total = breakdown.baseFee +
    breakdown.additionalFees.reduce((sum, fee) => sum + fee.amount, 0) +
    breakdown.penalties.reduce((sum, penalty) => sum + penalty.amount, 0) -
    breakdown.discounts.reduce((sum, discount) => sum + discount.amount, 0);

  return breakdown;
}

export function calculatePatentRenewalFees(
  daysUntilRenewal: number,
  yearNumber: number,
  isSmallEntity: boolean,
  hasMultiplePatents: boolean
): FeeBreakdown {
  const breakdown: FeeBreakdown = {
    baseFee: 0,
    additionalFees: [],
    penalties: [],
    discounts: [],
    total: 0
  };

  // Base fee calculation - increases with year
  const yearlyIncrease = Math.min((yearNumber - 1) * 20, 400); // Cap at £400 increase
  breakdown.baseFee = 70 + yearlyIncrease;

  // Small entity discount (50% off base fee)
  if (isSmallEntity) {
    breakdown.discounts.push({
      description: 'Small Entity Discount (50%)',
      amount: Math.round(breakdown.baseFee * 0.5)
    });
  }

  // Portfolio discount for multiple patents
  if (hasMultiplePatents) {
    breakdown.discounts.push({
      description: 'Portfolio Discount (10%)',
      amount: Math.round(breakdown.baseFee * 0.1)
    });
  }

  // Late payment penalties
  if (daysUntilRenewal < 0) {
    if (daysUntilRenewal > -90) {
      // Within 3 months: 10% surcharge
      const surcharge = Math.round(breakdown.baseFee * 0.1);
      breakdown.penalties.push({
        description: 'Late Payment Surcharge (10%)',
        amount: surcharge
      });
    } else if (daysUntilRenewal > -180) {
      // 3-6 months: 50% surcharge
      const surcharge = Math.round(breakdown.baseFee * 0.5);
      breakdown.penalties.push({
        description: 'Late Payment Surcharge (50%)',
        amount: surcharge
      });
    } else {
      // After 6 months: reinstatement fee
      breakdown.penalties.push({
        description: 'Reinstatement Fee',
        amount: 300
      });
    }
  }

  // Additional fees for supplementary protection certificates
  if (yearNumber > 20) {
    breakdown.additionalFees.push({
      description: 'Supplementary Protection Fee',
      amount: 200
    });
  }

  // Calculate total
  breakdown.total = breakdown.baseFee +
    breakdown.additionalFees.reduce((sum, fee) => sum + fee.amount, 0) +
    breakdown.penalties.reduce((sum, penalty) => sum + penalty.amount, 0) -
    breakdown.discounts.reduce((sum, discount) => sum + discount.amount, 0);

  return breakdown;
}

export function formatFeeBreakdown(breakdown: FeeBreakdown): string {
  const parts = [
    `Base Fee: £${breakdown.baseFee}`,
    ...breakdown.additionalFees.map(fee => `${fee.description}: £${fee.amount}`),
    ...breakdown.penalties.map(penalty => `${penalty.description}: £${penalty.amount}`),
    ...breakdown.discounts.map(discount => `${discount.description}: -£${discount.amount}`),
    `Total: £${breakdown.total}`
  ];

  return parts.join('\n');
} 