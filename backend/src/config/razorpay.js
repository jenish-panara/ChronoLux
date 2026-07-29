const Razorpay = require('razorpay');

let razorpayInstance = null;

function getRazorpay() {
  if (razorpayInstance) {
    return razorpayInstance;
  }

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set');
  }

  razorpayInstance = new Razorpay({ key_id, key_secret });
  return razorpayInstance;
}

module.exports = { getRazorpay };
