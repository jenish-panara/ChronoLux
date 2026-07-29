const Order = require('../models/Order');

// Order status sequence flow
const STATUS_SEQUENCE = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

const getNextStatus = (currentStatus) => {
  const currentIndex = STATUS_SEQUENCE.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === STATUS_SEQUENCE.length - 1) {
    return null;
  }
  return STATUS_SEQUENCE[currentIndex + 1];
};

const updateOrderStatuses = async () => {
  try {
    // Transition interval (default 5 minutes = 300000ms, configurable via environment variable)
    const intervalMs = parseInt(process.env.ORDER_TRANSITION_INTERVAL_MS) || 5 * 60 * 1000;

    // Find all orders that can be transitioned.
    // Skip unpaid Razorpay orders — they must stay pending until payment is verified.
    const activeOrders = await Order.find({
      orderStatus: { $in: ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery'] },
      $or: [
        { paymentMethod: 'cod' },
        { paymentMethod: 'razorpay', paymentStatus: 'completed' },
      ],
    });

    const now = new Date();

    for (const order of activeOrders) {
      // Find the last entry in status history to determine when it was updated
      let lastUpdate = order.createdAt;
      if (order.statusHistory && order.statusHistory.length > 0) {
        // Sort history by updatedAt desc to find the latest
        const sortedHistory = [...order.statusHistory].sort((a, b) => b.updatedAt - a.updatedAt);
        lastUpdate = sortedHistory[0].updatedAt;
      }

      const elapsed = now - new Date(lastUpdate);

      if (elapsed >= intervalMs) {
        const nextStatus = getNextStatus(order.orderStatus);
        
        if (nextStatus) {
          console.log(`[Order Scheduler] Transitioning Order #${order._id} from ${order.orderStatus} to ${nextStatus}`);
          
          order.orderStatus = nextStatus;
          order.statusHistory.push({
            status: nextStatus,
            updatedAt: now
          });

          if (nextStatus === 'delivered') {
            order.deliveredAt = now;
            order.paymentStatus = 'completed';
          }

          await order.save();
        }
      }
    }
  } catch (error) {
    console.error('[Order Scheduler Error]:', error);
  }
};

exports.startOrderScheduler = () => {
  console.log('[Order Scheduler] Background order status tracker initialized.');
  // Check every 30 seconds
  setInterval(updateOrderStatuses, 30 * 1000);
};
