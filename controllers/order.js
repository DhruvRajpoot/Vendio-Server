import Order from "../database/models/order.js";
import Payment from "../database/models/payment.js";
import Cart from "../database/models/cart.js";
import {
  deliveryCharges,
  taxRate,
  couponCodes,
} from "../constants/constants.js";

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
        ? cart.totalPrice * couponCodes[couponCode]
        : 0;

    const taxes = (cart.totalPrice - discountAmount) * taxRate;

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

    // Handle Payment if Razorpay is used
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

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to place order", error: error.message });
  }
};

// Get all orders for a user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId })
      .populate("paymentId") // Populate payment details if available
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
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
