export const PLAN_DURATION_IN_MONTHS = {
  '1 Month': 1,
  '3 Months': 3,
  '6 Months': 6,
  '12 Months': 12,
};

export const calculateMembershipExpiry = (startDate, plan) => {
  const normalizedPlan = (plan || '').toString().trim().toLowerCase();
  const planKey = Object.keys(PLAN_DURATION_IN_MONTHS).find(
    key => key.toLowerCase() === normalizedPlan
  );
  const months = planKey ? PLAN_DURATION_IN_MONTHS[planKey] : null;

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

export const calculateRenewalExpiry = (currentExpiry, plan) => {
  const now = new Date();
  const currentExpiryDate = currentExpiry ? new Date(currentExpiry) : null;

  let baseDate;
  if (currentExpiryDate && currentExpiryDate > now) {
    baseDate = new Date(currentExpiryDate.getTime() + 1);
  } else {
    baseDate = now;
  }

  return calculateMembershipExpiry(baseDate, plan);
};
