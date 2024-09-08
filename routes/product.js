import express from "express";
import { getProducts, getProductDetails } from "../controllers/product.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductDetails);

export default router;
