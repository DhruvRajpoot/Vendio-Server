import express from "express";
import { getUserDetails, updateProfilePic } from "..//controllers/user.js";
import checkuser from "../middleware/checkuser.js";
import { upload } from "../utils/cloudinary.js";

const router = express.Router();

router.get("/getUserDetails", checkuser, getUserDetails);
router.put(
  "/updateProfilePic",
  checkuser,
  upload.single("file"),
  updateProfilePic
);

export default router;
