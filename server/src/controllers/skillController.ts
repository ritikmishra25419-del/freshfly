import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middleware/authMiddleware";

export const getAllSkills = async (req: AuthRequest, res: Response) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { category: "asc" },
    });
    res.json({ skills });
  } catch (err) {
    console.error("Get skills error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getMySkills = async (req: AuthRequest, res: Response) => {
  try {
    const userSkills = await prisma.userSkill.findMany({
      where: { userId: req.userId },
      include: { skill: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ skills: userSkills });
  } catch (err) {
    console.error("Get my skills error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const addSkill = async (req: AuthRequest, res: Response) => {
  try {
    const { skillId } = req.body;

    if (!skillId) {
      return res.status(400).json({ message: "Skill ID is required." });
    }

    const skill = await prisma.skill.findUnique({ where: { id: Number(skillId) } });
    if (!skill) return res.status(404).json({ message: "Skill not found." });

    const existing = await prisma.userSkill.findUnique({
      where: { userId_skillId: { userId: req.userId!, skillId: Number(skillId) } },
    });

    if (existing) {
      return res.status(409).json({ message: "You already have this skill." });
    }

    const userSkill = await prisma.userSkill.create({
      data: { userId: req.userId!, skillId: Number(skillId) },
      include: { skill: true },
    });

    res.status(201).json({ message: "Skill added.", skill: userSkill });
  } catch (err) {
    console.error("Add skill error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const removeSkill = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const userSkill = await prisma.userSkill.findUnique({ where: { id } });
    if (!userSkill) return res.status(404).json({ message: "Skill not found." });
    if (userSkill.userId !== req.userId) {
      return res.status(403).json({ message: "Not your skill." });
    }

    await prisma.userSkill.delete({ where: { id } });
    res.json({ message: "Skill removed." });
  } catch (err) {
    console.error("Remove skill error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getSkillQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const skillId = Number(req.params.skillId);

    const questions = await prisma.skillQuestion.findMany({
      where: { skillId },
      select: {
        id: true,
        question: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
      },
    });

    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found for this skill." });
    }

    res.json({ questions });
  } catch (err) {
    console.error("Get questions error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const submitAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const skillId = Number(req.params.skillId);
    const { answers } = req.body as { answers: Record<number, string> };

    if (!answers) {
      return res.status(400).json({ message: "Answers are required." });
    }

    const userSkill = await prisma.userSkill.findUnique({
      where: { userId_skillId: { userId: req.userId!, skillId } },
    });

    if (!userSkill) {
      return res.status(404).json({ message: "Add this skill first before taking the test." });
    }

    if (userSkill.verified) {
      return res.status(409).json({ message: "You already passed this assessment." });
    }

    const questions = await prisma.skillQuestion.findMany({ where: { skillId } });

    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctAnswer) correct++;
    }

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 70;

    await prisma.userSkill.update({
      where: { userId_skillId: { userId: req.userId!, skillId } },
      data: {
        score,
        verified: passed,
        verifiedAt: passed ? new Date() : null,
      },
    });

    res.json({
      message: passed
        ? `🎉 You passed! ${score}% — skill verified.`
        : `You scored ${score}%. You need 70% to pass. Try again!`,
      score,
      passed,
      correct,
      total: questions.length,
    });
  } catch (err) {
    console.error("Submit assessment error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};