import express from "express";
import {
  createOrder,
  getUserOrders,
  updateOrderStatus,
} from "../controllers/order.js";

const router = express.Router();
import checkuser from "../middleware/checkuser.js";

router.post("/", checkuser, createOrder);
router.get("/", checkuser, getUserOrders);
// router.put("/orders/status", updateOrderStatus);

export default router;
