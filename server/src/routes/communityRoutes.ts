import { Router } from "express";
import {
  getPosts,
  createPost,
  addComment,
  reactToPost,
  deletePost,
} from "../controllers/communityController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAuth, getPosts);
router.post("/", requireAuth, createPost);
router.post("/:id/comments", requireAuth, addComment);
router.post("/:id/react", requireAuth, reactToPost);
router.delete("/:id", requireAuth, deletePost);

export default router;