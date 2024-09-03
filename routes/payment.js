import express from "express";
import { createPayment, verifyPayment } from "../controllers/payment.js";

const router = express.Router();
import checkuser from "../middleware/checkuser.js";

router.post("/create", checkuser, createPayment);
router.post("/verify", checkuser, verifyPayment);

export default router;
