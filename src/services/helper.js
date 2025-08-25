export const calculateDaysLeft = (expiryDate) => {
  if (!expiryDate) {
    return "No expiry date available";
  }

  const currentDate = new Date();
  const timeDifference = expiryDate.toDate() - currentDate;
  const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return "Not Verified";
  }

  return `${daysLeft} days left`;
};
