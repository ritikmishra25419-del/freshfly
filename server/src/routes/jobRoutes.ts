import { Router } from "express";
import {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  closeJob,
} from "../controllers/jobController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAuth, getJobs);
router.post("/", requireAuth, createJob);
router.get("/my", requireAuth, getMyJobs);
router.get("/:id", requireAuth, getJobById);
router.put("/:id/close", requireAuth, closeJob);

export default router;