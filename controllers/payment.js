import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../database/models/payment.js";
import Order from "../database/models/order.js";
import Cart from "../database/models/cart.js";
import mongoose from "mongoose";

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

    order.paymentId = payment._id;
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

// Verify Payment
export const verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
      req.body;

    const payment = await Payment.findOne({ razorpayOrderId, orderId }).session(
      session
    );

    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.paymentStatus === "Paid") {
      await session.commitTransaction();
      return res.status(200).json({ message: "Payment already processed" });
    }

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature) {
      payment.paymentStatus = "Failed";
      await payment.save({ session });

      const order = await Order.findById(orderId).session(session);
      if (order) {
        order.orderStatus = "Cancelled";
        await order.save({ session });
      }

      await session.commitTransaction();
      return res.status(400).json({ message: "Invalid signature" });
    }

    payment.paymentStatus = "Paid";
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    await payment.save({ session });

    const order = await Order.findById(orderId).session(session);
    if (order) {
      order.orderStatus = "Placed";
      await order.save({ session });

      const cart = await Cart.findOne({ userId: order.userId }).session(
        session
      );
      if (cart) {
        await Cart.findByIdAndDelete(cart._id).session(session);
      }
    }

    await session.commitTransaction();
    res.status(200).json({ message: "Payment verified and successful" });
  } catch (error) {
    await session.abortTransaction();
    res
      .status(500)
      .json({ message: "Payment verification failed", error: error.message });
  } finally {
    session.endSession();
  }
};

// Process Refund
export const processRefund = async (paymentId, session) => {
  try {
    const payment = await Payment.findById(paymentId).session(session);

    if (!payment || payment.paymentStatus !== "Paid") {
      return { success: true };
    }

    await razorpayInstance.payments.refund(payment.razorpayPaymentId, {
      amount: payment.amount,
    });

    payment.paymentStatus = "Refunded";
    await payment.save({ session });

    return { success: true };
  } catch (error) {
    return { error: error.message || "Failed to process refund" };
  }
};
