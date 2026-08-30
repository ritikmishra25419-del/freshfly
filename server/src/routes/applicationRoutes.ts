import { Router } from "express";
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  rateApplication,
} from "../controllers/applicationController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/job/:jobId", requireAuth, applyToJob);
router.get("/my", requireAuth, getMyApplications);
router.get("/job/:jobId", requireAuth, getJobApplications);
router.put("/:id/status", requireAuth, updateApplicationStatus);
router.post("/:id/rate", requireAuth, rateApplication);

export default router;