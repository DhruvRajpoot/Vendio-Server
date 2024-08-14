import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
  addBulkToCart,
} from "../controllers/cart.js";
import checkUser from "../middleware/checkUser.js";

const router = express.Router();

router.post("/", checkUser, addToCart);

router.get("/", checkUser, getCart);

router.put("/", checkUser, updateCart);

router.delete("/:productId", checkUser, removeFromCart);

router.delete("/", checkUser, clearCart);

router.post("/bulk", checkUser, addBulkToCart);

export default router;
