export function normalizeOrderStatus(status: unknown) {
  return String(status ?? '').trim().toLowerCase();
}

export function isCancelledStatus(status: unknown) {
  return normalizeOrderStatus(status).includes('cancel');
}

export function isDeliveredStatus(status: unknown) {
  return normalizeOrderStatus(status) === 'delivered';
}

export function isOngoingStatus(status: unknown) {
  const normalizedStatus = normalizeOrderStatus(status);

  return (
    normalizedStatus === 'pending' ||
    normalizedStatus === 'order confirmed' ||
    normalizedStatus === 'preparing' ||
    normalizedStatus === 'out for delivery'
  );
}
