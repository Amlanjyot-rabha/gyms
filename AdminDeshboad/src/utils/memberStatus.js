export const EXPIRING_WINDOW_DAYS = 5;

export const getRemainingDays = (expiry) => {
  const diff = new Date(expiry) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getComputedMemberStatus = (member) => {
  const remainingDays = getRemainingDays(member.membershipEnd);

  if (remainingDays <= 0 || member.status === 'expired') {
    return 'expired';
  }

  if (remainingDays <= EXPIRING_WINDOW_DAYS && member.status === 'active') {
    return 'expiring';
  }

  return member.status || 'active';
};
