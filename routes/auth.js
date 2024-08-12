import express from "express";
import {
  signup,
  login,
  googleregister,
  googlelogin,
  getAccessToken,
  forgotpassword,
  setNewPassword,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google/register", googleregister);
router.post("/google/login", googlelogin);
router.post("/getaccesstoken", getAccessToken);
router.post("/forgotpassword", forgotpassword);
router.post("/setnewpassword", setNewPassword);

export default router;
