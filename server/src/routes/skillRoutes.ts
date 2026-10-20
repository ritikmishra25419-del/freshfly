import { Router } from "express";
import {
  getAllSkills,
  getMySkills,
  addSkill,
  removeSkill,
  getSkillQuestions,
  submitAssessment,
} from "../controllers/skillController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAuth, getAllSkills);
router.get("/my", requireAuth, getMySkills);
router.post("/add", requireAuth, addSkill);
router.delete("/:id", requireAuth, removeSkill);
router.get("/:skillId/questions", requireAuth, getSkillQuestions);
router.post("/:skillId/assess", requireAuth, submitAssessment);

export default router;