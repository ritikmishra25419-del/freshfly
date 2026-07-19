import { Router } from "express";
import {
  getMyProfile,
  getProfileById,
  updateMyProfile,
  changePassword,
} from "../controllers/profileController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/me", requireAuth, getMyProfile);
router.put("/me", requireAuth, updateMyProfile);
router.get("/:id", requireAuth, getProfileById);
router.put("/password", requireAuth, changePassword);

export default router;