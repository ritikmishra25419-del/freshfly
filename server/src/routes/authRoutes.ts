import { Router } from "express";
import {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;