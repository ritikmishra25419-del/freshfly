import { Router } from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAuth, getMyNotifications);
router.put("/:id/read", requireAuth, markAsRead);
router.put("/read/all", requireAuth, markAllAsRead);

export default router;

