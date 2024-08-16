import express from "express";
import {
  addProductToWishlist,
  getWishlist,
  removeProductFromWishlist,
  clearWishlist,
} from "../controllers/wishlist.js";
import checkuser from "../middleware/checkuser.js";

const router = express.Router();

router.post("/", checkuser, addProductToWishlist);
router.get("/", checkuser, getWishlist);
router.delete("/", checkuser, removeProductFromWishlist);
router.delete("/clear", checkuser, clearWishlist);

export default router;
