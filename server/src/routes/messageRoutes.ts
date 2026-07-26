import { Router } from "express";
import {
  getMyConversations,
  getMessages,
  sendMessage,
} from "../controllers/messageController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAuth, getMyConversations);
router.get("/:conversationId", requireAuth, getMessages);
router.post("/:conversationId", requireAuth, sendMessage);

export default router;