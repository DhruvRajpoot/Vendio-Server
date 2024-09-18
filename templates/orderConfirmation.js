import { contactEmail, clientUrl } from "../config/baseurl.js";

const orderConfirmation = (order) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Vendio</title>
        <style>
            body {
                font-family: Helvetica, Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                color: #333333;
            }
            .container {
                width: 100%;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .email-content {
                width: 600px;
                background-color: #ffffff;
                margin: 0 auto;
                padding: 15px;
                border-radius: 8px;
                overflow: hidden;
            }
            .header {
                background-color: #00897B;
                padding: 20px;
                text-align: center;
            }
            .header img {
                width: 100px;
                height: auto;
            }
            .content {
                padding: 20px;
            }
            .content h2 {
                color: #00897B;
                font-size: 18px;
                font-weight: bold;
            }
            .content p {
                font-size: 14px;
                line-height: 1.6;
                color: #555555;
            }
            .order-details {
                border-top: 1px solid #eeeeee;
                padding-top: 15px;
                margin-top: 15px;
            }
            .order-summary {
                background-color: #f9f9f9;
                padding: 10px;
                margin-top: 15px;
                border-radius: 5px;
            }
            .order-summary p {
                font-size: 14px;
                margin: 0;
                padding: 5px 0;
            }
            .footer {
                background-color: #f4f4f4;
                padding: 10px;
                text-align: center;
                font-size: 13px;
                color: #666666;
                border-top: 1px solid #e0e0e0;
                margin-top: 20px;
            }
            .footer p {
                margin: 5px 0;
            }
            .footer a {
                color: #0077c2;
                text-decoration: none;
                font-weight: bold;
            }
            .button {
                display: block;
                width: 100%;
                max-width: 200px;
                margin: 20px auto;
                padding: 12px 10px;
                text-align: center;
                color: #ffffff;
                background-color: #00897B;
                text-decoration: none;
                border-radius: 5px;
                font-size: 14px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <table class="email-content" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="header">
                        <img src="https://res.cloudinary.com/dp3kpqzce/image/upload/v1724084071/logo_scddl1.png" alt="Vendio Logo">
                    </td>
                </tr>
                <tr>
                    <td class="content">
                        <h2>Hello ${order.shippingAddress.name},</h2>
                        <p>Thank you for shopping with us! Your order has been successfully placed and is now being processed. Below are the details of your order:</p>
                        
                        <div class="order-details">
                            <h3 style="color: #00897B;">Order Summary</h3>
                            <p><strong>Order Date:</strong> ${orderDate}</p>
                            ${order.items.map(item => `
                              <div class="order-summary">
                                  <p><strong>Product:</strong> ${item.product.title}</p>
                                  <p><strong>Quantity:</strong> ${item.quantity}</p>
                                  <p><strong>Price:</strong> ₹${item.totalPrice}</p>
                              </div>
                            `).join('')}
                            
                            <div class="order-summary">
                                <p><strong>Total Items:</strong> ${order.totalItems}</p>
                                <p><strong>Total Price:</strong> ₹${order.totalPrice}</p>
                                ${(order.discountAmount > 0) ?
                                `<p><strong>Discount:</strong> ₹${order.discountAmount}</p>`: ""}
                                <p><strong>Taxes:</strong> ₹${order.taxes}</p>
                                <p><strong>Delivery Charges:</strong> ₹${order.deliveryCharges}</p>
                                <p><strong>Final Price:</strong> ₹${order.finalPrice}</p>
                                <p><strong>Payment Method:</strong> ${order.paymentMethod === "razorpay" ? "Razorpay" : "Cash on Delivery"}</p>
                                ${(order.paymentMethod === "razorpay") ?
                                `<p><strong>Payment Status:</strong> ${order.paymentId.paymentStatus}</p>` : ""
                                }
                            </div>
                            
                            <div class="order-summary">
                                <p><strong>Shipping Address:</strong></p>
                                <p>${order.shippingAddress.name}</p>
                                <p>${order.shippingAddress.addressLine}, ${order.shippingAddress.area}, ${order.shippingAddress.landmark}</p>
                                <p>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
                                <p>${order.shippingAddress.phone}</p>
                            </div>
                        </div>
                        
                        <a href="${clientUrl}/account/orders" class="button" style="color:white">View My Orders</a>
                    </td>
                </tr>
                <tr>
                    <td class="footer">
                        <p>&copy; 2024 Vendio. All rights reserved.</p>
                        <p>If you have any questions about your order, please <a href="mailto:${contactEmail}">contact us</a>.</p>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
  `;
};

export default orderConfirmation;
