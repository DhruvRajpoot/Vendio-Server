import express from "express";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  getUserAddresses,
  getAddressById,
} from "../controllers/address.js";
import checkuser from "../middleware/checkuser.js";

const router = express.Router();

router.post("/", checkuser, createAddress);

router.put("/:addressId", checkuser, updateAddress);

router.delete("/:addressId", checkuser, deleteAddress);

router.get("/", checkuser, getUserAddresses);

router.get("/:addressId", checkuser, getAddressById);

export default router;
