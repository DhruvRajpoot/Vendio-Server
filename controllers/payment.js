import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../database/models/payment.js";
import Order from "../database/models/order.js";
import Cart from "../database/models/cart.js";

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Payment
export const createPayment = async (req, res) => {
  const { orderId, amount } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `${orderId}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Create Payment Record
    const payment = new Payment({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      paymentMethod: "razorpay",
      paymentStatus: "Pending",
    });

    await payment.save();

    // Update Order with Razorpay Order ID
    order.razorpayPaymentId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res
      .status(500)
      .json({ message: "Payment creation failed", error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
      req.body;

    const payment = await Payment.findOne({
      razorpayOrderId,
      orderId,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Verify Signature
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature) {
      payment.paymentStatus = "Failed";
      await payment.save();

      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = "Failed";
        await order.save();
      }

      return res.status(400).json({ message: "Invalid signature" });
    }

    // Update Payment Status to Paid
    payment.paymentStatus = "Paid";
    payment.razorpayPaymentId = razorpayPaymentId;
    await payment.save();

    // Update Order Status to Placed
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = "Paid";
      order.orderStatus = "Placed";
      order.razorpayPaymentId = razorpayPaymentId;
      await order.save();

      const cart = await Cart.findOne({ userId: order.userId });
      if (cart) {
        await Cart.findByIdAndDelete(cart._id);
      }
    }

    res.status(200).json({ message: "Payment verified and successful" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res
      .status(500)
      .json({ message: "Payment verification failed", error: error.message });
  }
};
