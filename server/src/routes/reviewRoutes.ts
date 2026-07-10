import { Router } from "express";
import {
  submitReview,
  getFresherReviews,
  getPendingReviews,
  getMyReviewsAsMentor,
} from "../controllers/reviewController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/", requireAuth, submitReview);
router.get("/my", requireAuth, getMyReviewsAsMentor);
router.get("/fresher/:fresherId", requireAuth, getFresherReviews);
router.get("/pending", requireAuth, getPendingReviews);

export default router;