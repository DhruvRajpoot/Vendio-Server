import express from "express";
import {
  signup,
  login,
  google,
  getAccessToken,
  forgotpassword,
  setNewPassword,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-email", resendVerificationEmail);
router.post("/login", login);
router.post("/google", google);
router.post("/getaccesstoken", getAccessToken);
router.post("/forgotpassword", forgotpassword);
router.post("/setnewpassword", setNewPassword);

export default router;
