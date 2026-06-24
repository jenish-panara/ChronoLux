const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports =  sendOrderConfirmationEmail = async (
  customerEmail,
  customerName,
  order
) => {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Thank You For Your Order 🎉</h2>

      <p>Hello ${customerName},</p>

      <p>Your order has been placed successfully.</p>

      <h3>Order Details</h3>

      ${order.orderItems.map(item => `
        <div style="margin-bottom:20px;">
          <img
            src="${item.image}"
            width="120"
            height="120"
            style="object-fit:contain;border-radius:8px;"
          />

          <h4>${item.name}</h4>

          <p>Quantity: ${item.quantity}</p>

          <p>Price: ₹${item.finalPrice}</p>
        </div>
      `).join('')}

      <h3>Total: ₹${order.total}</h3>

      <p>
        We will notify you when your order ships.
      </p>

      <br>

      <strong>ChronoLux Team</strong>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Order Confirmation #${order._id}`,
    html,
  });
};