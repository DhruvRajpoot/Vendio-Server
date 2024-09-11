import Order from "../database/models/order.js";
import Payment from "../database/models/payment.js";
import Cart from "../database/models/cart.js";
import {
  deliveryCharges,
  taxRate,
  couponCodes,
} from "../constants/constants.js";
import { processRefund } from "./payment.js";
import mongoose from "mongoose";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod, couponCode } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or not found." });
    }

    const discountAmount =
      couponCode && couponCodes[couponCode]
        ? Math.floor(cart.totalPrice * couponCodes[couponCode])
        : 0;

    const taxes = Math.floor((cart.totalPrice - discountAmount) * taxRate);

    const finalPrice =
      cart.totalPrice - discountAmount + deliveryCharges + taxes;

    const order = new Order({
      userId,
      items: cart.items,
      shippingAddress,
      paymentMethod,
      discountAmount,
      deliveryCharges,
      taxes,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      finalPrice,
      orderStatus: paymentMethod === "cod" ? "Placed" : "Pending",
    });

    await order.save();

    // If payment method is razorpay, create a payment document
    if (paymentMethod === "razorpay") {
      const payment = new Payment({
        orderId: order._id,
        paymentMethod,
        paymentStatus: "Pending",
        amount: finalPrice,
      });
      await payment.save();

      order.paymentId = payment._id;
      await order.save();
    }

    if (paymentMethod === "cod") {
      await Cart.findByIdAndDelete(cart._id);
    }

    await order.populate("items.product");

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to place order", error: error.message });
  }
};

// Get all orders for the logged in user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId })
      .populate("items.product")
      .populate("paymentId")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};

// Cancel an order
export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "Cancelled") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    order.orderStatus = "Cancelled";
    await order.save({ session });

    // Process refund if payment method is Razorpay and refund is needed
    if (order.paymentMethod === "razorpay" && order.paymentId) {
      const refundResult = await processRefund(order.paymentId, session);
      if (refundResult.success) {
        order.isRefunded = true;
        await order.save({ session });
      } else {
        await session.abortTransaction();
        return res.status(500).json({ message: refundResult.error });
      }
    }

    await session.commitTransaction();

    await order.populate("paymentId");
    await order.populate("items.product");

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    if (
      session.transaction.state === "STARTING" ||
      session.transaction.state === "TRANSACTION_IN_PROGRESS"
    ) {
      await session.abortTransaction();
    }
    res
      .status(500)
      .json({ message: "Failed to cancel order", error: error.message });
  } finally {
    session.endSession();
  }
};

// Update order status (triggered by shipper)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();
    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update order status", error: error.message });
  }
};
