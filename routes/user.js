import express from "express";
import { updateProfilePic } from "..//controllers/user.js";
import checkuser from "../middleware/checkuser.js";

const router = express.Router();

router.put("/updateProfilePic", checkuser, updateProfilePic);

export default router;
