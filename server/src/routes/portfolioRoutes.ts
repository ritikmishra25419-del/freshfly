import { Router } from "express";
import {
  addPortfolioItem,
  getMyPortfolio,
  getUserPortfolio,
  deletePortfolioItem,
  updatePortfolioItem,
} from "../controllers/portfolioController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/my", requireAuth, getMyPortfolio);
router.post("/", requireAuth, addPortfolioItem);
router.get("/user/:userId", requireAuth, getUserPortfolio);
router.put("/:id", requireAuth, updatePortfolioItem);
router.delete("/:id", requireAuth, deletePortfolioItem);

export default router;