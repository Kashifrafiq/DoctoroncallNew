type ExpiryDate = Date | string | { toDate: () => Date } | null | undefined;

function toDate(expiryDate: ExpiryDate): Date | null {
  if (!expiryDate) {
    return null;
  }

  if (typeof expiryDate === 'object' && 'toDate' in expiryDate) {
    return expiryDate.toDate();
  }

  const parsed = new Date(expiryDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function calculateDaysLeft(expiryDate: ExpiryDate): string {
  const expiry = toDate(expiryDate);

  if (!expiry) {
    return 'Not Subscribed';
  }

  const currentDate = new Date();
  const timeDifference = expiry.getTime() - currentDate.getTime();
  const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return 'Not Subscribed';
  }

  return `${daysLeft} days left`;
}
