import express from "express";
import {
  createOrder,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controllers/order.js";

const router = express.Router();
import checkuser from "../middleware/checkuser.js";

router.post("/", checkuser, createOrder);
router.get("/", checkuser, getUserOrders);
// router.put("/orders/status", updateOrderStatus);
// router.put("/orders/payment", updatePaymentStatus);

export default router;
