import express from "express";
import {
  cancelOrder,
  createOrder,
  getUserOrders,
  updateOrderStatus,
} from "../controllers/order.js";

const router = express.Router();
import checkuser from "../middleware/checkuser.js";

router.post("/", checkuser, createOrder);
router.get("/", checkuser, getUserOrders);
router.put("/cancel", checkuser, cancelOrder);
// router.put("/orders/status", updateOrderStatus);

export default router;
