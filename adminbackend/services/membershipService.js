const PLAN_DURATION_IN_MONTHS = {
  '1 Month': 1,
  '3 Months': 3,
  '6 Months': 6,
  '12 Months': 12,
};

export const getPlanDurationInMonths = (plan) => {
  return PLAN_DURATION_IN_MONTHS[plan] || null;
};



/**
 * Compute the membership expiry date as the last day of the "inclusive" target month.
 * Example: 15 May + 1 Month => 31 May.
 * Example: 15 May + 3 Months => 31 July.
 */
export const calculateMembershipExpiry = (startDate, plan) => {
  const months = getPlanDurationInMonths(plan);
  if (!months) {
    throw new Error(`Invalid membership plan: ${plan}`);
  }

  const baseDate = new Date(startDate);
  // 1 month = 30 days
  const daysToAdd = months * 30;
  
  const expiryDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  expiryDate.setHours(23, 59, 59, 999);
  return expiryDate;
};

/**
 * Compute expiry when renewing.
 * If current expiry is still active, extend from the day after current expiry.
 * Otherwise, start from today.
 */
export const calculateRenewalExpiry = (currentExpiry, plan, now = new Date()) => {
  const currentExpiryDate = currentExpiry ? new Date(currentExpiry) : null;
  const today = new Date(now);

  let baseDate;
  if (currentExpiryDate && currentExpiryDate > today) {
    baseDate = new Date(currentExpiryDate.getTime() + 1);
  } else {
    baseDate = today;
  }

  return calculateMembershipExpiry(baseDate, plan);
};

export default {
  calculateMembershipExpiry,
  calculateRenewalExpiry,
  getPlanDurationInMonths,
};
