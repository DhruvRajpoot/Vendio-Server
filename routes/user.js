import express from "express";
import { getUserDetails, updateProfilePic } from "..//controllers/user.js";
import checkuser from "../middleware/checkuser.js";

const router = express.Router();

router.get("/getUserDetails", checkuser, getUserDetails);
router.put("/updateProfilePic", checkuser, updateProfilePic);

export default router;
