import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
  syncCart,
} from "../controllers/cart.js";
import checkuser from "../middleware/checkuser.js";

const router = express.Router();

router.post("/", checkuser, addToCart);

router.get("/", checkuser, getCart);

router.put("/", checkuser, updateCart);

router.delete("/:productId", checkuser, removeFromCart);

router.delete("/", checkuser, clearCart);

router.post("/sync", checkuser, syncCart);

export default router;
