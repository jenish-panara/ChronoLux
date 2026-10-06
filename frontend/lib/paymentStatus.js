// Shared helper to render payment status badges on order pages.

export function getPaymentBadge(order) {
  if (!order) return { label: 'Unknown', className: 'bg-[var(--clx-surface)] text-[var(--clx-text-muted)] border-[var(--clx-border-light)]' };

  if (order.paymentMethod === 'cod') {
    return order.paymentStatus === 'completed'
      ? { label: 'Paid', className: 'bg-green-50 text-green-700 border-green-200' }
      : { label: 'Pay on Delivery', className: 'bg-gray-50 text-gray-600 border-gray-200' };
  }

  switch (order.paymentStatus) {
    case 'completed':
      return { label: 'Paid', className: 'bg-green-50 text-green-700 border-green-200' };
    case 'failed':
      return { label: 'Failed', className: 'bg-red-50 text-red-700 border-red-200' };
    case 'refunded':
      return { label: 'Refunded', className: 'bg-blue-50 text-blue-700 border-blue-200' };
    default:
      return { label: 'Payment Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
}
