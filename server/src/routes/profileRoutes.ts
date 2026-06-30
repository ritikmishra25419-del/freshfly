import { Router } from "express";
import { getMyProfile, getProfileById, updateMyProfile } from "../controllers/profileController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/me", requireAuth, getMyProfile);
router.put("/me", requireAuth, updateMyProfile);
router.get("/:id", requireAuth, getProfileById);

export default router;
