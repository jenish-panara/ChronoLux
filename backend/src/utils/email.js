const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = sendOrderConfirmationEmail = async (
  customerEmail,
  customerName,
  order
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #FAFAF8;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          background-color: #FAFAF8;
          padding: 30px 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border: 1px solid #F0EDE8;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(10, 10, 10, 0.03);
        }
        .header {
          background-color: #0A0A0A;
          padding: 40px 20px;
          text-align: center;
          border-bottom: 3px solid #C9A96E;
        }
        .header h1 {
          color: #FFFFFF;
          margin: 0;
          font-size: 26px;
          font-family: Georgia, serif;
          font-weight: 600;
          letter-spacing: 2px;
        }
        .header h1 span {
          color: #C9A96E;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #1A1A1A;
          margin-top: 0;
          margin-bottom: 10px;
          font-weight: bold;
        }
        .intro-text {
          font-size: 14px;
          color: #6B6B6B;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .order-meta {
          background-color: #F8F7F5;
          border: 1px solid #E8E5E0;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 30px;
        }
        .order-meta table {
          width: 100%;
          border-collapse: collapse;
        }
        .order-meta td {
          font-size: 13px;
          color: #6B6B6B;
          padding: 4px 0;
        }
        .order-meta .label {
          font-weight: bold;
          color: #1A1A1A;
          width: 40%;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #0A0A0A;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          border-bottom: 1px solid #E8E5E0;
          padding-bottom: 8px;
          margin-top: 30px;
          margin-bottom: 15px;
        }
        .item-card {
          display: flex;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #F0EDE8;
        }
        .item-card:last-child {
          border-bottom: none;
        }
        .item-image-container {
          width: 70px;
          height: 70px;
          background-color: #F8F7F5;
          border: 1px solid #F0EDE8;
          border-radius: 6px;
          text-align: center;
          margin-right: 15px;
          display: inline-block;
          vertical-align: middle;
        }
        .item-image {
          max-width: 60px;
          max-height: 60px;
          padding: 5px;
          object-fit: contain;
        }
        .item-details {
          display: inline-block;
          vertical-align: middle;
          width: calc(100% - 190px);
        }
        .item-name {
          font-size: 14px;
          font-weight: bold;
          color: #1A1A1A;
          margin: 0;
        }
        .item-qty {
          font-size: 12px;
          color: #9A9A9A;
          margin: 3px 0 0 0;
        }
        .item-price {
          display: inline-block;
          vertical-align: middle;
          width: 90px;
          text-align: right;
          font-weight: bold;
          color: #1A1A1A;
          font-size: 14px;
        }
        .summary-table {
          width: 100%;
          margin-top: 20px;
          border-collapse: collapse;
        }
        .summary-table td {
          padding: 6px 0;
          font-size: 13px;
          color: #6B6B6B;
        }
        .summary-table .total-row td {
          font-size: 16px;
          font-weight: bold;
          color: #0A0A0A;
          border-top: 1px solid #E8E5E0;
          padding-top: 12px;
        }
        .address-box {
          font-size: 13px;
          color: #6B6B6B;
          line-height: 1.6;
          background-color: #FAFAF8;
          border: 1px solid #F0EDE8;
          border-radius: 8px;
          padding: 15px;
        }
        .footer {
          background-color: #F8F7F5;
          text-align: center;
          padding: 30px 20px;
          border-top: 1px solid #F0EDE8;
          font-size: 12px;
          color: #9A9A9A;
          line-height: 1.5;
        }
        .footer a {
          color: #C9A96E;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          
          <div class="header">
            <h1>Chrono<span>Lux</span></h1>
          </div>

          <div class="content">
            <p class="greeting">Thank You For Your Purchase!</p>
            <p class="intro-text">Hello ${customerName}, your order has been received and is currently being processed. Below are your order summary details.</p>

            <div class="order-meta">
              <table>
                <tr>
                  <td class="label">Order Number</td>
                  <td>#${order._id.toString().toUpperCase()}</td>
                </tr>
                <tr>
                  <td class="label">Order Date</td>
                  <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td class="label">Payment Method</td>
                  <td>${order.paymentMethod.toUpperCase()}</td>
                </tr>
              </table>
            </div>

            <div class="section-title">Order Details</div>
            
            <div style="margin-bottom: 20px;">
              ${order.orderItems.map(item => `
                <div class="item-card">
                  <div class="item-image-container">
                    <img src="${item.image}" alt="${item.name}" class="item-image" />
                  </div>
                  <div class="item-details">
                    <p class="item-name">${item.name}</p>
                    <p class="item-qty">Quantity: ${item.quantity}</p>
                  </div>
                  <div class="item-price">₹${item.finalPrice?.toLocaleString()}</div>
                </div>
              `).join('')}
            </div>

            <table class="summary-table">
              <tr>
                <td>Subtotal</td>
                <td style="text-align: right;">₹${order.subtotal?.toLocaleString()}</td>
              </tr>
              ${order.discount > 0 ? `
                <tr style="color: #2e7d32;">
                  <td>Discount Applied</td>
                  <td style="text-align: right;">-₹${order.discount?.toLocaleString()}</td>
                </tr>
              ` : ''}
              <tr>
                <td>Shipping</td>
                <td style="text-align: right; color: #2e7d32;">FREE</td>
              </tr>
              <tr class="total-row">
                <td>Total Paid</td>
                <td style="text-align: right;">₹${order.total?.toLocaleString()}</td>
              </tr>
            </table>

            <div class="section-title">Shipping Address</div>
            <div class="address-box">
              <strong style="color: #1A1A1A;">${order.shippingAddress?.name}</strong><br>
              Phone: ${order.shippingAddress?.mobile}<br>
              ${order.shippingAddress?.houseNo}, ${order.shippingAddress?.area}<br>
              ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}
            </div>

          </div>

          <div class="footer">
            <p>If you have any questions regarding your timepiece order, please feel free to contact us.</p>
            <p>&copy; ${new Date().getFullYear()} ChronoLux Store. All rights reserved.</p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Order Confirmation #${order._id}`,
    html,
  });
};